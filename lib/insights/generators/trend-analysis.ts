/**
 * Trend Analysis Generator
 *
 * Generates insights about spending trends:
 * - Month-over-month comparisons (total spending)
 * - Category-level trends (>15% change)
 * - Seasonal patterns
 */

import type { Insight, InsightGeneratorInput } from '@/lib/types/insights'
import { categories } from '@/lib/utils'

/**
 * Generate trend analysis insights
 */
export function generateTrendAnalysis(input: InsightGeneratorInput): Insight[] {
  const insights: Insight[] = []

  // Require at least 2 months of data for trends
  if (!input.previousMonths || input.previousMonths.length === 0) {
    return insights
  }

  // Get previous month for comparison
  const previousMonth = input.previousMonths[0]

  // Skip trend analysis if previous month has no spending data
  // (comparing to $0 gives meaningless percentages)
  if (previousMonth.totalSpent === 0) {
    return insights
  }

  // 1. Overall spending trend
  const totalChangeAmount = input.stats.totalSpent - previousMonth.totalSpent
  const totalChangePercent =
    previousMonth.totalSpent > 0
      ? (totalChangeAmount / previousMonth.totalSpent) * 100
      : 0

  // Only create insight if change is significant (>15%)
  if (Math.abs(totalChangePercent) >= 15) {
    const isIncrease = totalChangeAmount > 0

    insights.push({
      id: 'trend-overall-spending',
      type: 'trend_analysis',
      severity: isIncrease ? 'warning' : 'positive',
      title: isIncrease ? 'Overall Spending Increased' : 'Overall Spending Decreased',
      explanation: `Your total spending ${
        isIncrease ? 'increased' : 'decreased'
      } by ${Math.abs(totalChangePercent).toFixed(0)}% this month ($${input.stats.totalSpent.toFixed(
        0
      )} vs $${previousMonth.totalSpent.toFixed(0)} last month). ${
        isIncrease
          ? 'Review your expenses to identify areas where you can cut back.'
          : 'Great job controlling your spending!'
      }`,
      score: 0,
      metric: {
        current: input.stats.totalSpent,
        previous: previousMonth.totalSpent,
        change: totalChangeAmount,
        changePercent: totalChangePercent,
      },
      cta: {
        text: 'View Expenses',
        href: `/expenses?month=${input.currentMonth}`,
      },
    })
  }

  // 2. Category-level trends
  const currentCategoryMap = new Map(
    input.stats.spendingByCategory.map((c) => [c.category, c.amount])
  )
  const previousCategoryMap = new Map(
    previousMonth.spendingByCategory.map((c) => [c.category, c.amount])
  )

  // Combine all categories from both months
  const allCategories = new Set([
    ...currentCategoryMap.keys(),
    ...previousCategoryMap.keys(),
  ])

  const categoryTrends: Array<{
    category: string
    current: number
    previous: number
    change: number
    changePercent: number
  }> = []

  allCategories.forEach((category) => {
    const current = currentCategoryMap.get(category) || 0
    const previous = previousCategoryMap.get(category) || 0

    // Skip if both months are zero
    if (current === 0 && previous === 0) return

    const change = current - previous
    const changePercent = previous > 0 ? (change / previous) * 100 : 100

    // Only track significant changes (>15%)
    if (Math.abs(changePercent) >= 15 && current >= 50) {
      categoryTrends.push({
        category,
        current,
        previous,
        change,
        changePercent,
      })
    }
  })

  // Sort by absolute change (largest first)
  categoryTrends
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 4) // Top 4 category trends
    .forEach((trend) => {
      const categoryInfo = categories.find((c) => c.value === trend.category)
      const categoryLabel = categoryInfo?.label || trend.category
      const isIncrease = trend.change > 0

      insights.push({
        id: `trend-category-${trend.category}`,
        type: 'trend_analysis',
        severity:
          isIncrease && Math.abs(trend.changePercent) > 30
            ? 'warning'
            : isIncrease
              ? 'info'
              : 'positive',
        title: `${categoryLabel} ${isIncrease ? 'Increased' : 'Decreased'}`,
        explanation: `Your ${categoryLabel.toLowerCase()} spending ${
          isIncrease ? 'increased' : 'decreased'
        } by ${Math.abs(trend.changePercent).toFixed(0)}% ($${trend.current.toFixed(
          0
        )} vs $${trend.previous.toFixed(0)} last month).${
          isIncrease && Math.abs(trend.changePercent) > 30
            ? ' This is a significant increase - review recent expenses.'
            : ''
        }`,
        score: 0,
        category: trend.category,
        metric: {
          current: trend.current,
          previous: trend.previous,
          change: trend.change,
          changePercent: trend.changePercent,
        },
        cta: {
          text: `View ${categoryLabel}`,
          href: `/expenses?category=${trend.category}&month=${input.currentMonth}`,
        },
      })
    })

  // 3. Seasonal patterns (if 3+ months of data)
  if (input.previousMonths.length >= 2) {
    const last3Months = [
      input.stats.totalSpent,
      ...input.previousMonths.slice(0, 2).map((m) => m.totalSpent),
    ]

    const average = last3Months.reduce((sum, val) => sum + val, 0) / 3
    const currentDeviation = ((input.stats.totalSpent - average) / average) * 100

    // Only flag if significantly different from 3-month average (>25%)
    if (Math.abs(currentDeviation) > 25) {
      insights.push({
        id: 'trend-seasonal-pattern',
        type: 'trend_analysis',
        severity: currentDeviation > 0 ? 'warning' : 'info',
        title:
          currentDeviation > 0
            ? 'Spending Above 3-Month Average'
            : 'Spending Below 3-Month Average',
        explanation: `Your spending this month ($${input.stats.totalSpent.toFixed(
          0
        )}) is ${Math.abs(currentDeviation).toFixed(0)}% ${
          currentDeviation > 0 ? 'above' : 'below'
        } your 3-month average of $${average.toFixed(0)}. ${
          currentDeviation > 0
            ? 'This could indicate a seasonal pattern or unusual expenses.'
            : 'You are doing well compared to your recent spending habits!'
        }`,
        score: 0,
        metric: {
          current: input.stats.totalSpent,
          previous: average,
          change: input.stats.totalSpent - average,
          changePercent: currentDeviation,
        },
        cta: {
          text: 'View History',
          href: '/insights',
        },
      })
    }
  }

  return insights
}

/**
 * Generate a trend summary insight (for hero card when no critical budget issues)
 */
export function generateTrendSummary(input: InsightGeneratorInput): Insight | null {
  if (!input.previousMonths || input.previousMonths.length === 0) {
    return null
  }

  const previousMonth = input.previousMonths[0]

  // Skip if previous month has no data (comparing to $0 is meaningless)
  if (previousMonth.totalSpent === 0) {
    return null
  }

  const totalChangeAmount = input.stats.totalSpent - previousMonth.totalSpent
  const totalChangePercent =
    previousMonth.totalSpent > 0
      ? (totalChangeAmount / previousMonth.totalSpent) * 100
      : 0

  const isIncrease = totalChangeAmount > 0

  // Only create summary if change is noticeable (>10%)
  if (Math.abs(totalChangePercent) < 10) {
    return null
  }

  let severity: 'critical' | 'warning' | 'info' | 'positive'
  let title: string

  if (isIncrease) {
    if (totalChangePercent > 30) {
      severity = 'critical'
      title = '🔥 Spending Spike Detected'
    } else if (totalChangePercent > 20) {
      severity = 'warning'
      title = '⚠️ Spending Up Significantly'
    } else {
      severity = 'warning'
      title = 'Spending Increased This Month'
    }
  } else {
    if (Math.abs(totalChangePercent) > 20) {
      severity = 'positive'
      title = '🎯 Great Job! Major Savings'
    } else {
      severity = 'positive'
      title = 'Spending Down This Month'
    }
  }

  return {
    id: 'trend-summary',
    type: 'trend_analysis',
    severity,
    title,
    explanation: `Your spending ${
      isIncrease ? 'increased' : 'decreased'
    } by ${Math.abs(totalChangePercent).toFixed(0)}% compared to last month. You spent $${input.stats.totalSpent.toFixed(
      0
    )} this month vs $${previousMonth.totalSpent.toFixed(0)} last month (${
      isIncrease ? '+' : ''
    }$${Math.abs(totalChangeAmount).toFixed(0)}).`,
    score: 0,
    metric: {
      current: input.stats.totalSpent,
      previous: previousMonth.totalSpent,
      change: totalChangeAmount,
      changePercent: totalChangePercent,
    },
    cta: {
      text: 'View Breakdown',
      href: `/expenses?month=${input.currentMonth}`,
    },
  }
}
