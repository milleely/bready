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

// GET - Get complete net worth dashboard data
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get("userId")
    const householdIdParam = searchParams.get("householdId")

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      )
    }

    // 🚀 PERFORMANCE: Use householdId from query param if provided (skips duplicate lookup)
    let householdId: string
    if (householdIdParam) {
      householdId = householdIdParam
    } else {
      // Fallback: Require authentication and get household ID
      const result = await getHouseholdId()
      if (result instanceof NextResponse) return result
      householdId = result
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

    // Calculate month boundaries for expense queries
    const monthStart = startOfMonth(targetDate)
    const monthEnd = endOfMonth(targetDate)

    // 🚀 PERFORMANCE: Fetch ALL data in parallel (8 queries → ~300-400ms instead of 1200ms sequential)
    const [
      incomeSources,
      assets,
      liabilities,
      expenseOverride,
      householdUsers,
      userExpenses,
      otherSharedExpenses,
    ] = await Promise.all([
      // Core financial data
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

      // Household data for expense calculations
      prisma.user.findMany({
        where: { householdId },
        select: { id: true },
      }),

      // User's expenses (with category for breakdown calculation)
      prisma.expense.findMany({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
        },
        select: {
          amount: true,
          isShared: true,
          category: true, // Include category for breakdown
        },
      }),

      // Other household members' SHARED expenses (with category)
      prisma.expense.findMany({
        where: {
          userId: { not: userId },
          isShared: true,
          date: { gte: monthStart, lte: monthEnd },
        },
        select: {
          amount: true,
          category: true,
        },
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

    // 🚀 PERFORMANCE: Calculate monthly expenses AND breakdown in single pass (no duplicate queries)
    const userCount = Math.max(householdUsers.length, 1)
    let monthlyExpenses = 0
    let actualSpending = undefined

    if (expenseOverride?.useOverride) {
      // Use manual override for total (skip calculation)
      monthlyExpenses = expenseOverride.amount
    } else {
      // Calculate both total AND breakdown from the SAME expense data (already fetched in parallel)
      let totalExpenses = 0
      let needsSpent = 0
      let wantsSpent = 0
      let otherSpent = 0

      // Process user's expenses (personal 100% + shared ÷ userCount)
      userExpenses.forEach((expense) => {
        const amount = expense.isShared
          ? expense.amount / userCount
          : expense.amount

        totalExpenses += amount

        // Categorize for breakdown
        const budgetCategory = categorizeBudgetType(expense.category)
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

      // Process other household members' SHARED expenses
      otherSharedExpenses.forEach((expense) => {
        const yourShare = expense.amount / userCount
        totalExpenses += yourShare

        // Categorize for breakdown
        const budgetCategory = categorizeBudgetType(expense.category)
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

      monthlyExpenses = Math.round(totalExpenses * 100) / 100

      // Build actualSpending object (already calculated above)
      actualSpending = {
        needsSpent: Math.round(needsSpent * 100) / 100,
        wantsSpent: Math.round(wantsSpent * 100) / 100,
        savingsSpent: 0, // Not tracking yet - future feature
        total: Math.round((needsSpent + wantsSpent + otherSpent) * 100) / 100,
      }
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
