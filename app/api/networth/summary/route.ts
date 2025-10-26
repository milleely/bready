/**
 * GET /api/networth/summary?userId=xxx
 *
 * Calculate and return complete net worth summary for a user
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/db"
import {
  generateNetWorthSummary,
  groupAssetsByCategory,
  groupLiabilitiesByCategory,
  generateBudgetAllocation,
  generatePaycheckAllocation,
  calculateMonthlyIncome,
} from "@/lib/networth/calculations"
import type { NetWorthDashboardData, IncomeSource, IncomeFrequency, Asset, AssetCategory, Liability, LiabilityCategory } from "@/lib/types/networth"
import { startOfMonth, endOfMonth } from "date-fns"

// GET - Get complete net worth dashboard data
export async function GET(req: NextRequest) {
  try {
    // Get authenticated Clerk user
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const requestedUserId = searchParams.get("userId")

    if (!requestedUserId) {
      return NextResponse.json(
        { error: "Missing required parameter: userId" },
        { status: 400 }
      )
    }

    // Verify the authenticated user is requesting their own data
    if (clerkUserId !== requestedUserId) {
      return NextResponse.json(
        { error: "Forbidden: Cannot access other users' data" },
        { status: 403 }
      )
    }

    const userId = requestedUserId

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
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
      // Auto-calculate from expense tracker (current month)
      const now = new Date()
      const monthStart = startOfMonth(now)
      const monthEnd = endOfMonth(now)

      const expenses = await prisma.expense.findMany({
        where: {
          userId,
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      // Calculate total (personal expenses + share of shared expenses)
      const personalExpenses = expenses
        .filter((e) => !e.isShared)
        .reduce((sum, e) => sum + e.amount, 0)

      const sharedExpenses = expenses
        .filter((e) => e.isShared)
        .reduce((sum, e) => sum + e.amount, 0)

      // Get total number of users in household to split shared expenses
      const householdUsers = await prisma.user.count({
        where: { householdId: user.id },
      })

      const sharedPerPerson = householdUsers > 0 ? sharedExpenses / householdUsers : 0

      monthlyExpenses = personalExpenses + sharedPerPerson
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

    // Fetch actual spending breakdown (categorized by needs/wants/savings)
    let actualSpending = undefined
    try {
      const baseUrl = req.nextUrl.origin
      const response = await fetch(`${baseUrl}/api/networth/expense-breakdown?userId=${userId}`)
      if (response.ok) {
        actualSpending = await response.json()
      }
    } catch (error) {
      // If expense breakdown fails, continue without it (feature is optional)
      console.warn("Failed to fetch expense breakdown:", error)
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
