/**
 * Spending Patterns Generator
 *
 * Generates insights about behavioral patterns:
 * - Shared vs personal expense shifts
 * - Spending streaks (consecutive days with expenses)
 * - Inactivity alerts (no expenses logged)
 * - High-frequency categories
 */

import type { Insight, InsightGeneratorInput } from '@/lib/types/insights'

/**
 * Generate spending pattern insights
 */
export function generateSpendingPatterns(input: InsightGeneratorInput): Insight[] {
  const insights: Insight[] = []

  // 1. Shared vs personal spending shift
  if (input.previousMonths && input.previousMonths.length > 0) {
    const currentSharedPercent =
      input.stats.totalSpent > 0
        ? (input.stats.sharedExpenses / input.stats.totalSpent) * 100
        : 0

    // Calculate previous month's shared percentage
    const prevMonth = input.previousMonths[0]
    const prevMonthExpenses = input.expenses.filter((exp) => {
      const expMonth = new Date(exp.date).toISOString().slice(0, 7)
      return expMonth === prevMonth.month
    })

    const prevShared = prevMonthExpenses
      .filter((e) => e.isShared)
      .reduce((sum, e) => sum + e.amount, 0)
    const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const prevSharedPercent = prevTotal > 0 ? (prevShared / prevTotal) * 100 : 0

    const sharedShift = currentSharedPercent - prevSharedPercent

    // Only flag if shift is significant (>15 percentage points)
    if (Math.abs(sharedShift) > 15) {
      const isIncrease = sharedShift > 0

      insights.push({
        id: 'pattern-shared-shift',
        type: 'spending_pattern',
        severity: 'info',
        title: isIncrease
          ? 'More Shared Expenses This Month'
          : 'More Personal Expenses This Month',
        explanation: `Your shared expenses ${
          isIncrease ? 'increased' : 'decreased'
        } to ${currentSharedPercent.toFixed(0)}% of total spending (vs ${prevSharedPercent.toFixed(
          0
        )}% last month). ${
          isIncrease
            ? 'Household spending is higher this month.'
            : 'More personal purchases this month compared to shared household expenses.'
        }`,
        score: 0,
        metric: {
          current: input.stats.sharedExpenses,
          previous: prevShared,
          change: input.stats.sharedExpenses - prevShared,
          changePercent: sharedShift,
        },
        cta: {
          text: 'View Expenses',
          href: `/expenses?month=${input.currentMonth}`,
        },
      })
    }
  }

  // 2. Spending streak detection
  const sortedExpenses = [...input.expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (sortedExpenses.length > 0) {
    let currentStreak = 1
    let lastDate = new Date(sortedExpenses[0].date)

    for (let i = 1; i < sortedExpenses.length; i++) {
      const expenseDate = new Date(sortedExpenses[i].date)
      const dayDiff = Math.floor(
        (lastDate.getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (dayDiff === 1) {
        currentStreak++
        lastDate = expenseDate
      } else {
        break
      }
    }

    // Only create insight if streak is notable (7+ consecutive days)
    if (currentStreak >= 7) {
      insights.push({
        id: 'pattern-spending-streak',
        type: 'spending_pattern',
        severity: currentStreak >= 14 ? 'warning' : 'info',
        title: `${currentStreak}-Day Spending Streak`,
        explanation: `You've logged expenses for ${currentStreak} consecutive days. ${
          currentStreak >= 14
            ? 'This might indicate consistent spending - review if expenses are necessary.'
            : 'You are tracking your spending consistently!'
        }`,
        score: 0,
        metric: {
          current: currentStreak,
        },
        cta: {
          text: 'View Recent Expenses',
          href: `/expenses?month=${input.currentMonth}`,
        },
      })
    }
  }

  // 3. Inactivity alert (no expenses logged recently)
  if (sortedExpenses.length > 0) {
    const daysSinceLastExpense = Math.floor(
      (Date.now() - new Date(sortedExpenses[0].date).getTime()) / (1000 * 60 * 60 * 24)
    )

    // Alert if >3 days without logging expenses
    if (daysSinceLastExpense >= 3) {
      insights.push({
        id: 'pattern-inactivity',
        type: 'spending_pattern',
        severity: 'info',
        title: 'No Recent Expenses Logged',
        explanation: `It's been ${daysSinceLastExpense} days since your last logged expense. Don't forget to track your spending to get accurate insights!`,
        score: 0,
        metric: {
          current: daysSinceLastExpense,
        },
        cta: {
          text: 'Add Expense',
          href: '/expenses',
        },
      })
    }
  }

  // 4. High-frequency category (category with most transactions)
  const categoryFrequency = new Map<string, number>()
  input.expenses.forEach((exp) => {
    categoryFrequency.set(exp.category, (categoryFrequency.get(exp.category) || 0) + 1)
  })

  if (categoryFrequency.size > 0) {
    const topCategory = Array.from(categoryFrequency.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0]

    // Only create insight if frequency is notable (8+ transactions in one category)
    if (topCategory[1] >= 8) {
      const categoryAmount =
        input.stats.spendingByCategory.find((c) => c.category === topCategory[0])
          ?.amount || 0

      insights.push({
        id: 'pattern-high-frequency',
        type: 'spending_pattern',
        severity: 'info',
        title: `Frequent ${topCategory[0]} Purchases`,
        explanation: `You made ${topCategory[1]} ${topCategory[0].toLowerCase()} purchases this month ($${categoryAmount.toFixed(
          0
        )} total). Consider if there are opportunities to reduce frequency or consolidate purchases.`,
        score: 0,
        category: topCategory[0],
        metric: {
          current: topCategory[1], // Number of transactions
        },
        cta: {
          text: `View ${topCategory[0]}`,
          href: `/expenses?category=${topCategory[0]}&month=${input.currentMonth}`,
        },
      })
    }
  }

  return insights
}
