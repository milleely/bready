import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getHouseholdId } from '@/lib/auth'
import type { RuleBasedInsightsResponse, InsightGeneratorInput } from '@/lib/types/insights'
import { generateBudgetAlerts, generateBudgetHealthSummary } from '@/lib/insights/generators/budget-alerts'
import { generateTrendAnalysis, generateTrendSummary } from '@/lib/insights/generators/trend-analysis'
import { generateSpendingPatterns } from '@/lib/insights/generators/spending-patterns'
import { scoreAndSortInsights } from '@/lib/insights/priority-scorer'

/**
 * GET /api/insights/rules?month=YYYY-MM
 *
 * Generates rule-based financial insights for a given month.
 * Returns scored and sorted insights ready for display.
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication and get household ID
    const householdId = await getHouseholdId()
    if (householdId instanceof NextResponse) return householdId

    // Get month from query params (default to current month)
    const searchParams = request.nextUrl.searchParams
    const month = searchParams.get('month') || getCurrentMonth()

    // Parse month
    const [year, monthNum] = month.split('-').map(Number)
    const startDate = new Date(year, monthNum - 1, 1)
    const endDate = new Date(year, monthNum, 0, 23, 59, 59)

    // Calculate days into month and days left
    const today = new Date()
    const daysIntoMonth = today.getDate()
    const daysLeftInMonth = endDate.getDate() - daysIntoMonth

    // Fetch current month data in parallel
    const [expenses, budgets, users] = await Promise.all([
      prisma.expense.findMany({
        where: {
          user: { householdId },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: { user: true },
        orderBy: { date: 'desc' },
      }),
      prisma.budget.findMany({
        where: {
          householdId,
          month,
        },
      }),
      prisma.user.findMany({
        where: { householdId },
      }),
    ])

    // Calculate current month stats
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const sharedExpenses = expenses
      .filter((exp) => exp.isShared)
      .reduce((sum, exp) => sum + exp.amount, 0)

    const spendingPerPerson = users.map((user) => {
      const userExpenses = expenses.filter((exp) => exp.userId === user.id)
      const total = userExpenses.reduce((sum, exp) => sum + exp.amount, 0)
      const shared = userExpenses
        .filter((exp) => exp.isShared)
        .reduce((sum, exp) => sum + exp.amount, 0)
      const personal = total - shared

      return {
        userId: user.id,
        name: user.name,
        total,
        shared,
        personal,
      }
    })

    const categoryMap = new Map<string, number>()
    expenses.forEach((exp) => {
      categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount)
    })

    const spendingByCategory = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
      })
    )

    const stats = {
      totalSpent,
      sharedExpenses,
      spendingPerPerson,
      spendingByCategory,
    }

    // Fetch previous 3 months data for trend analysis
    const previousMonths = await fetchPreviousMonthsData(householdId, year, monthNum, 3)

    // Build input for insight generators
    const input: InsightGeneratorInput = {
      expenses: expenses.map((exp) => ({
        id: exp.id,
        amount: exp.amount,
        category: exp.category,
        date: exp.date,
        isShared: exp.isShared,
        userId: exp.userId,
      })),
      budgets: budgets.map((b) => ({
        id: b.id,
        category: b.category,
        amount: b.amount,
        userId: b.userId,
      })),
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
      })),
      stats,
      previousMonths,
      householdId,
      currentMonth: month,
      daysIntoMonth,
      daysLeftInMonth,
    }

    // Generate insights from all generators
    const budgetAlerts = generateBudgetAlerts(input)
    const budgetHealthSummary = generateBudgetHealthSummary(input)
    const trendAnalysis = generateTrendAnalysis(input)
    const trendSummary = generateTrendSummary(input)
    const spendingPatterns = generateSpendingPatterns(input)

    // Combine all insights
    const allInsights = [
      ...(budgetHealthSummary ? [budgetHealthSummary] : []),
      ...budgetAlerts,
      ...(trendSummary ? [trendSummary] : []),
      ...trendAnalysis,
      ...spendingPatterns,
    ]

    // Score and sort insights
    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0)
    const scoredInsights = scoreAndSortInsights(allInsights, {
      daysLeftInMonth,
      totalBudget,
      affectedUserCount: users.length,
    })

    // Build response
    const response: RuleBasedInsightsResponse = {
      insights: scoredInsights,
      metadata: {
        householdId,
        month,
        generatedAt: new Date().toISOString(),
        dataPoints: {
          expenseCount: expenses.length,
          budgetCount: budgets.length,
          monthsOfData: previousMonths.length + 1,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    // Secure error logging
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to generate insights:', error)
    } else {
      console.error('API error:', error instanceof Error ? error.message : 'Unknown error')
    }

    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

/**
 * Fetch previous months data for trend analysis
 */
async function fetchPreviousMonthsData(
  householdId: string,
  currentYear: number,
  currentMonth: number,
  count: number
): Promise<
  Array<{
    month: string
    totalSpent: number
    spendingByCategory: Array<{ category: string; amount: number }>
  }>
> {
  const previousMonths: Array<{
    month: string
    totalSpent: number
    spendingByCategory: Array<{ category: string; amount: number }>
  }> = []

  for (let i = 1; i <= count; i++) {
    let year = currentYear
    let month = currentMonth - i

    // Handle year rollover
    if (month <= 0) {
      month += 12
      year -= 1
    }

    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const expenses = await prisma.expense.findMany({
      where: {
        user: { householdId },
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0)

    const categoryMap = new Map<string, number>()
    expenses.forEach((exp) => {
      categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount)
    })

    const spendingByCategory = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
      })
    )

    previousMonths.push({
      month: monthStr,
      totalSpent,
      spendingByCategory,
    })
  }

  return previousMonths
}

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth(): string {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
}
