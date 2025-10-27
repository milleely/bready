/**
 * Budget Alerts Generator
 *
 * Generates insights for budget-related issues:
 * - Over-budget warnings (>100%)
 * - Approaching budget warnings (80-100%)
 * - On-track positive feedback
 */

import type { Insight, InsightGeneratorInput } from '@/lib/types/insights'
import { categories } from '@/lib/utils'

/**
 * Generate budget alert insights
 */
export function generateBudgetAlerts(input: InsightGeneratorInput): Insight[] {
  const insights: Insight[] = []

  // Calculate spending per category
  const spendingByCategory = new Map<string, number>()
  input.expenses.forEach((exp) => {
    spendingByCategory.set(
      exp.category,
      (spendingByCategory.get(exp.category) || 0) + exp.amount
    )
  })

  // Check each budget
  input.budgets.forEach((budget) => {
    // Calculate spent amount:
    // - For user-specific budgets (userId !== null): only count that user's expenses
    // - For shared budgets (userId === null): count all expenses in category
    let spent = 0
    if (budget.userId) {
      // Personal budget - only count expenses from this user
      spent = input.expenses
        .filter((exp) => exp.userId === budget.userId && exp.category === budget.category)
        .reduce((sum, exp) => sum + exp.amount, 0)
    } else {
      // Shared budget - count all expenses in category
      spent = spendingByCategory.get(budget.category) || 0
    }

    const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
    const remaining = budget.amount - spent

    // Get category info for display
    const categoryInfo = categories.find((c) => c.value === budget.category)
    const categoryLabel = categoryInfo?.label || budget.category

    // Get user name for user-specific budgets
    const user = budget.userId ? input.users.find((u) => u.id === budget.userId) : null
    const budgetOwner = user ? `${user.name}'s` : 'Shared'

    // Over budget (>100%)
    if (percentUsed > 100) {
      const overagePercent = percentUsed - 100
      const overageAmount = spent - budget.amount

      insights.push({
        id: `budget-alert-over-${budget.id}`,
        type: 'budget_alert',
        severity: overagePercent > 30 ? 'critical' : 'warning',
        title: `${budgetOwner} ${categoryLabel} Budget Exceeded`,
        explanation: `${budgetOwner === 'Shared' ? 'The household has' : `${user?.name} has`} spent $${spent.toFixed(
          0
        )} on ${categoryLabel.toLowerCase()}, which is ${overagePercent.toFixed(
          0
        )}% over the $${budget.amount.toFixed(
          0
        )} budget. Consider reviewing recent expenses or adjusting your budget.`,
        score: 0, // Will be calculated by scorer
        category: budget.category,
        metric: {
          current: spent,
          budget: budget.amount,
          change: overageAmount,
          changePercent: overagePercent,
          percentUsed,
        },
        actionSteps: [
          `Review ${categoryLabel.toLowerCase()} expenses to identify unnecessary spending`,
          `Reduce future ${categoryLabel.toLowerCase()} expenses by $${Math.ceil(
            overageAmount / Math.max(1, input.daysLeftInMonth)
          )}/day`,
          `Or increase your ${categoryLabel.toLowerCase()} budget to $${Math.ceil(
            spent
          )}`,
        ],
        cta: {
          text: 'View Expenses',
          href: `/expenses?category=${budget.category}&month=${input.currentMonth}`,
        },
      })
    }
    // Approaching budget (80-100%)
    else if (percentUsed >= 80 && percentUsed <= 100) {
      insights.push({
        id: `budget-alert-approaching-${budget.id}`,
        type: 'budget_alert',
        severity: 'warning',
        title: `${budgetOwner} ${categoryLabel} Approaching Limit`,
        explanation: `${budgetOwner === 'Shared' ? 'The household has' : `${user?.name} has`} used ${percentUsed.toFixed(
          0
        )}% of the ${categoryLabel.toLowerCase()} budget ($${spent.toFixed(
          0
        )} of $${budget.amount.toFixed(
          0
        )}). There's $${remaining.toFixed(
          0
        )} remaining for the rest of the month.`,
        score: 0,
        category: budget.category,
        metric: {
          current: spent,
          budget: budget.amount,
          change: remaining,
          percentUsed,
        },
        actionSteps: [
          `Track ${categoryLabel.toLowerCase()} expenses closely`,
          `Limit spending to $${Math.ceil(
            remaining / Math.max(1, input.daysLeftInMonth)
          )}/day to stay within budget`,
        ],
        cta: {
          text: 'Adjust Budget',
          href: `/budgets?month=${input.currentMonth}`,
        },
      })
    }
    // On track (50-80%)
    else if (percentUsed >= 50 && percentUsed < 80) {
      // Only add positive feedback for larger categories (top 3)
      const topCategories = Array.from(spendingByCategory.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map((e) => e[0])

      if (topCategories.includes(budget.category)) {
        insights.push({
          id: `budget-alert-ontrack-${budget.id}`,
          type: 'budget_alert',
          severity: 'positive',
          title: `${budgetOwner} ${categoryLabel} On Track`,
          explanation: `${budgetOwner === 'Shared' ? 'The household is' : `${user?.name} is`} ${percentUsed.toFixed(
            0
          )}% through the ${categoryLabel.toLowerCase()} budget with $${remaining.toFixed(
            0
          )} remaining. At this pace, it'll finish the month within budget.`,
          score: 0,
          category: budget.category,
          metric: {
            current: spent,
            budget: budget.amount,
            change: remaining,
            percentUsed,
          },
          cta: {
            text: 'View Budget',
            href: `/budgets?month=${input.currentMonth}`,
          },
        })
      }
    }
  })

  return insights
}

/**
 * Generate overall budget health summary insight
 * (Used as hero card when multiple budgets are set)
 */
export function generateBudgetHealthSummary(
  input: InsightGeneratorInput
): Insight | null {
  if (input.budgets.length === 0) return null

  // Calculate spending per category
  const spendingByCategory = new Map<string, number>()
  input.expenses.forEach((exp) => {
    spendingByCategory.set(
      exp.category,
      (spendingByCategory.get(exp.category) || 0) + exp.amount
    )
  })

  // Count budget status and track amounts per status
  let onTrack = 0
  let approaching = 0
  let over = 0

  // Track total spent and budget for each status category
  let overSpent = 0
  let overBudget = 0
  let approachingSpent = 0
  let approachingBudget = 0
  let onTrackSpent = 0
  let onTrackBudget = 0

  input.budgets.forEach((budget) => {
    // Calculate spent amount:
    // - For user-specific budgets (userId !== null): only count that user's expenses
    // - For shared budgets (userId === null): count all expenses in category
    let spent = 0
    if (budget.userId) {
      // Personal budget - only count expenses from this user
      spent = input.expenses
        .filter((exp) => exp.userId === budget.userId && exp.category === budget.category)
        .reduce((sum, exp) => sum + exp.amount, 0)
    } else {
      // Shared budget - count all expenses in category
      spent = spendingByCategory.get(budget.category) || 0
    }

    const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

    if (percentUsed > 100) {
      over++
      overSpent += spent
      overBudget += budget.amount
    } else if (percentUsed >= 80) {
      approaching++
      approachingSpent += spent
      approachingBudget += budget.amount
    } else {
      onTrack++
      onTrackSpent += spent
      onTrackBudget += budget.amount
    }
  })

  // Determine overall severity
  let severity: 'critical' | 'warning' | 'info' | 'positive'
  let title: string
  let explanation: string

  if (over > 0) {
    severity = over >= 3 ? 'critical' : 'warning'
    title = `⚠️ ${over} ${over === 1 ? 'Budget' : 'Budgets'} Over Limit`
    explanation = `You've exceeded ${over} budget${
      over === 1 ? '' : 's'
    } this month. `

    if (approaching > 0) {
      explanation += `Additionally, ${approaching} ${
        approaching === 1 ? 'budget is' : 'budgets are'
      } approaching their limits. `
    }

    explanation += `Review your spending and consider adjusting your budgets or reducing expenses.`
  } else if (approaching > 0) {
    severity = 'warning'
    title = `${approaching} ${approaching === 1 ? 'Budget' : 'Budgets'} Approaching Limit`
    explanation = `You're at 80-100% of your budget in ${approaching} ${
      approaching === 1 ? 'category' : 'categories'
    }. Monitor your spending closely to stay on track.`
  } else {
    severity = 'positive'
    title = "All Budgets On Track! 🎯"
    explanation = `Great job! All ${input.budgets.length} of your budgets are on track. You're spending within your limits and maintaining good financial habits.`
  }

  // Determine which metric to show based on reported status
  let metricCurrent: number
  let metricBudget: number

  if (over > 0) {
    // Show stats for over-budget budgets
    metricCurrent = overSpent
    metricBudget = overBudget
  } else if (approaching > 0) {
    // Show stats for approaching budgets
    metricCurrent = approachingSpent
    metricBudget = approachingBudget
  } else {
    // Show total stats for on-track budgets
    metricCurrent = onTrackSpent
    metricBudget = onTrackBudget
  }

  return {
    id: 'budget-health-summary',
    type: 'budget_alert',
    severity,
    title,
    explanation,
    score: 0, // Will be calculated by scorer
    metric: {
      current: metricCurrent,
      budget: metricBudget,
      percentUsed: metricBudget > 0 ? (metricCurrent / metricBudget) * 100 : 0,
    },
    cta: {
      text: over > 0 || approaching > 0 ? 'Review Budgets' : 'View All Budgets',
      href: `/budgets?month=${input.currentMonth}`,
    },
  }
}
