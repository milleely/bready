/**
 * GET /api/networth/summary?userId=xxx
 *
 * Calculate and return complete net worth summary for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getHouseholdId } from "@/lib/auth"
import {
  generateNetWorthSummary,
  groupAssetsByCategory,
  groupLiabilitiesByCategory,
  generateBudgetAllocation,
  generatePaycheckAllocation,
  calculateMonthlyIncome,
} from "@/lib/networth/calculations"
import { categorizeBudgetType } from "@/lib/networth/category-mapping"
import type { NetWorthDashboardData, IncomeSource, IncomeFrequency, Asset, AssetCategory, Liability, LiabilityCategory } from "@/lib/types/networth"
import { startOfMonth, endOfMonth } from "date-fns"
import { updateActivity } from "@/lib/networth/activity-tracker"

// GET - Get complete net worth dashboard data
export async function GET(req: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    // Update activity timestamp to prevent inactivity timeout
    await updateActivity()

    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get("userId")

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      )
    }

    // Verify the userId belongs to the authenticated user's household
    const user = await prisma.user.findFirst({
      where: {
        id: requestedUserId,
        householdId,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found in your household" },
        { status: 403 }
      )
    }

    const userId = requestedUserId

    // Parse optional month parameter (format: YYYY-MM) or default to current month
    const monthParam = searchParams.get("month")
    let targetDate: Date
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [year, month] = monthParam.split('-').map(Number)
      targetDate = new Date(year, month - 1) // month is 0-indexed in Date constructor
    } else {
      targetDate = new Date() // Current month
    }

    // Fetch all data in parallel
    const [incomeSources, assets, liabilities, expenseOverride] = await Promise.all([
      prisma.incomeSource.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.asset.findMany({
        where: { userId },
        orderBy: [{ category: "asc" }, { createdAt: "desc" }],
      }),
      prisma.liability.findMany({
        where: { userId },
        orderBy: [{ category: "asc" }, { createdAt: "desc" }],
      }),
      prisma.monthlyExpenseOverride.findUnique({
        where: { userId },
      }),
    ])

    // Cast Prisma string types to TypeScript union types for type safety
    const typedIncomeSources: IncomeSource[] = incomeSources.map(income => ({
      ...income,
      frequency: income.frequency as IncomeFrequency,
    }))

    const typedAssets: Asset[] = assets.map(asset => ({
      ...asset,
      category: asset.category as AssetCategory,
    }))

    const typedLiabilities: Liability[] = liabilities.map(liability => ({
      ...liability,
      category: liability.category as LiabilityCategory,
    }))

    // Calculate monthly expenses (either from override or auto-calculated)
    let monthlyExpenses = 0

    if (expenseOverride?.useOverride) {
      // Use manual override
      monthlyExpenses = expenseOverride.amount
    } else {
      // Auto-calculate from expense tracker (selected month)
      const monthStart = startOfMonth(targetDate)
      const monthEnd = endOfMonth(targetDate)

      // Get all household member IDs
      const householdUsers = await prisma.user.findMany({
        where: { householdId },
        select: { id: true }
      })
      const householdUserIds = householdUsers.map(u => u.id)
      const userCount = householdUsers.length

      // Query 1: User's expenses (personal 100% + shared ÷ userCount)
      const userExpenses = await prisma.expense.findMany({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        select: { amount: true, isShared: true },
      })

      // Query 2: Other household members' SHARED expenses (÷ userCount)
      const otherSharedExpenses = await prisma.expense.findMany({
        where: {
          userId: { in: householdUserIds, not: userId },
          isShared: true,
          date: { gte: monthStart, lte: monthEnd },
        },
        select: { amount: true },
      })

      // Calculate user's total monthly expenses
      let total = 0

      // Process user's expenses
      userExpenses.forEach((expense) => {
        const amount = expense.isShared
          ? expense.amount / Math.max(userCount, 1)
          : expense.amount
        total += amount
      })

      // Process other household members' shared expenses
      otherSharedExpenses.forEach((expense) => {
        const yourShare = expense.amount / Math.max(userCount, 1)
        total += yourShare
      })

      monthlyExpenses = Math.round(total * 100) / 100
    }

    // Generate net worth summary
    const summary = generateNetWorthSummary(
      userId,
      typedIncomeSources,
      typedAssets,
      typedLiabilities,
      monthlyExpenses
    )

    // Group assets and liabilities by category
    const assetsByCategory = groupAssetsByCategory(typedAssets)
    const liabilitiesByCategory = groupLiabilitiesByCategory(typedLiabilities)

    // Generate budget allocation (50/30/20 rule by default)
    const monthlyIncome = calculateMonthlyIncome(typedIncomeSources)
    const budgetAllocation = generateBudgetAllocation(monthlyIncome)

    // Generate paycheck allocation (bi-weekly breakdown)
    const paycheckAllocation =
      typedIncomeSources.length > 0 ? generatePaycheckAllocation(monthlyIncome) : undefined

    // Calculate actual spending breakdown (categorized by needs/wants/savings)
    let actualSpending = undefined
    try {
      // Get all household member IDs for shared expense queries
      const householdUsers = await prisma.user.findMany({
        where: { householdId },
        select: { id: true }
      })

      const householdUserIds = householdUsers.map(u => u.id)
      const userCount = householdUsers.length

      // Get selected month boundaries (same as monthlyExpenses calculation)
      const monthStart = startOfMonth(targetDate)
      const monthEnd = endOfMonth(targetDate)

      // Query 1: User's expenses (personal 100% + shared ÷ userCount)
      const userExpenses = await prisma.expense.findMany({
        where: {
          userId,  // Only this user's expenses
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          amount: true,
          category: true,
          isShared: true,
        },
      })

      // Query 2: Other household members' SHARED expenses (÷ userCount)
      const otherSharedExpenses = await prisma.expense.findMany({
        where: {
          userId: { in: householdUserIds, not: userId },  // Other members only
          isShared: true,  // Only shared expenses
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        select: {
          amount: true,
          category: true,
        },
      })

      // Calculate totals by budget category
      let needsSpent = 0
      let wantsSpent = 0
      let otherSpent = 0

      // Process user's expenses
      userExpenses.forEach((expense) => {
        const budgetCategory = categorizeBudgetType(expense.category)

        // Personal: 100%, Shared: your portion (÷ userCount)
        const amount = expense.isShared
          ? expense.amount / Math.max(userCount, 1)
          : expense.amount

        switch (budgetCategory) {
          case "needs":
            needsSpent += amount
            break
          case "wants":
            wantsSpent += amount
            break
          case "other":
            otherSpent += amount
            break
        }
      })

      // Process other household members' shared expenses
      otherSharedExpenses.forEach((expense) => {
        const budgetCategory = categorizeBudgetType(expense.category)

        // Always divide by userCount (these are all shared)
        const yourShare = expense.amount / Math.max(userCount, 1)

        switch (budgetCategory) {
          case "needs":
            needsSpent += yourShare
            break
          case "wants":
            wantsSpent += yourShare
            break
          case "other":
            otherSpent += yourShare
            break
        }
      })

      actualSpending = {
        needsSpent: Math.round(needsSpent * 100) / 100, // Round to 2 decimals
        wantsSpent: Math.round(wantsSpent * 100) / 100,
        savingsSpent: 0, // Not tracking yet - future feature
        total: Math.round((needsSpent + wantsSpent + otherSpent) * 100) / 100,
      }
    } catch (error) {
      // If expense breakdown fails, continue without it (feature is optional)
      console.warn("Failed to calculate expense breakdown:", error)
    }

    // Assemble complete dashboard data
    const dashboardData: NetWorthDashboardData = {
      user: {
        id: user.id,
        name: user.name,
      },
      summary,
      incomeSources: typedIncomeSources,
      assetsByCategory,
      liabilitiesByCategory,
      budgetAllocation,
      paycheckAllocation,
      expenseOverride: expenseOverride ?? undefined,
      actualSpending,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error("Error calculating net worth summary:", error)
    return NextResponse.json(
      { error: "Failed to calculate net worth summary" },
      { status: 500 }
    )
  }
}
