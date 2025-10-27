/**
 * Priority Scoring Algorithm for Financial Insights
 *
 * Calculates a 0-100 priority score for each insight to determine
 * which insights should be shown first and which should be the hero insight.
 *
 * Scoring Formula:
 * - Financial Impact (40%): How much money is involved
 * - Urgency (30%): How soon action is needed
 * - Actionability (20%): Whether there's a clear next step
 * - User Engagement (10%): How many users are affected
 */

import type { Insight, PriorityScoreFactors } from '@/lib/types/insights'

/**
 * Calculate priority score for a single insight
 *
 * @param insight - The insight to score
 * @param context - Additional context for scoring (days left in month, total budget, etc.)
 * @returns Score from 0-100 (higher = more important)
 */
export function calculateInsightScore(
  insight: Insight,
  context: {
    daysLeftInMonth: number
    totalBudget?: number
    affectedUserCount?: number
  }
): number {
  const factors: PriorityScoreFactors = {
    financialImpact: calculateFinancialImpact(insight, context.totalBudget),
    urgency: calculateUrgency(insight, context.daysLeftInMonth),
    actionability: calculateActionability(insight),
    userEngagement: calculateUserEngagement(insight, context.affectedUserCount),
  }

  // Sum all factors (max 100 points)
  const totalScore = Math.min(
    100,
    factors.financialImpact +
      factors.urgency +
      factors.actionability +
      factors.userEngagement
  )

  return Math.round(totalScore)
}

/**
 * Financial Impact Score (0-40 points, 40% weight)
 *
 * Measures how much money is involved relative to total budget.
 * Higher amounts get higher scores.
 */
function calculateFinancialImpact(
  insight: Insight,
  totalBudget?: number
): number {
  const MAX_POINTS = 40

  // If no metric data, assign based on severity
  if (!insight.metric) {
    switch (insight.severity) {
      case 'critical':
        return MAX_POINTS
      case 'warning':
        return MAX_POINTS * 0.7
      case 'info':
        return MAX_POINTS * 0.4
      case 'positive':
        return MAX_POINTS * 0.2
    }
  }

  const { current, budget, change, changePercent } = insight.metric

  // For budget alerts: Score based on how much over budget
  if (budget && current > budget) {
    const overagePercent = ((current - budget) / budget) * 100

    if (overagePercent > 50) return MAX_POINTS // >50% over = max impact
    if (overagePercent > 30) return MAX_POINTS * 0.9
    if (overagePercent > 15) return MAX_POINTS * 0.7
    return MAX_POINTS * 0.5
  }

  // For trend analysis: Score based on % change or absolute amount
  if (changePercent !== undefined) {
    const absChange = Math.abs(changePercent)

    if (absChange > 50) return MAX_POINTS * 0.8
    if (absChange > 30) return MAX_POINTS * 0.6
    if (absChange > 20) return MAX_POINTS * 0.4
    return MAX_POINTS * 0.2
  }

  // Fallback: Use current amount relative to total budget
  if (totalBudget && current > 0) {
    const percentOfBudget = (current / totalBudget) * 100

    if (percentOfBudget > 30) return MAX_POINTS * 0.7
    if (percentOfBudget > 20) return MAX_POINTS * 0.5
    if (percentOfBudget > 10) return MAX_POINTS * 0.3
    return MAX_POINTS * 0.1
  }

  // Default: Moderate impact
  return MAX_POINTS * 0.3
}

/**
 * Urgency Score (0-30 points, 30% weight)
 *
 * Measures how soon action is needed.
 * Time-sensitive issues get higher scores.
 */
function calculateUrgency(insight: Insight, daysLeftInMonth: number): number {
  const MAX_POINTS = 30

  // Critical severity always gets high urgency
  if (insight.severity === 'critical') {
    return MAX_POINTS
  }

  // Budget alerts are more urgent near end of month
  if (insight.type === 'budget_alert') {
    if (daysLeftInMonth <= 3) return MAX_POINTS
    if (daysLeftInMonth <= 7) return MAX_POINTS * 0.8
    if (daysLeftInMonth <= 14) return MAX_POINTS * 0.5
    return MAX_POINTS * 0.3
  }

  // Warnings are moderately urgent
  if (insight.severity === 'warning') {
    return MAX_POINTS * 0.6
  }

  // Trends and patterns are less urgent
  if (insight.type === 'trend_analysis' || insight.type === 'spending_pattern') {
    return MAX_POINTS * 0.4
  }

  // Positive feedback and recommendations are low urgency
  return MAX_POINTS * 0.2
}

/**
 * Actionability Score (0-20 points, 20% weight)
 *
 * Measures whether there's a clear next step.
 * Insights with CTAs get higher scores.
 */
function calculateActionability(insight: Insight): number {
  const MAX_POINTS = 20

  // Has a clear CTA button
  if (insight.cta) {
    return MAX_POINTS
  }

  // Has action steps listed
  if (insight.actionSteps && insight.actionSteps.length > 0) {
    return MAX_POINTS * 0.8
  }

  // Budget alerts are always actionable (can adjust budget or review expenses)
  if (insight.type === 'budget_alert') {
    return MAX_POINTS * 0.7
  }

  // Recommendations are inherently actionable
  if (insight.type === 'recommendation') {
    return MAX_POINTS * 0.6
  }

  // Trends provide context but less clear action
  if (insight.type === 'trend_analysis') {
    return MAX_POINTS * 0.4
  }

  // Default: Somewhat actionable
  return MAX_POINTS * 0.3
}

/**
 * User Engagement Score (0-10 points, 10% weight)
 *
 * Measures how many users are affected.
 * Shared expenses and household-wide issues get higher scores.
 */
function calculateUserEngagement(
  insight: Insight,
  affectedUserCount?: number
): number {
  const MAX_POINTS = 10

  // If explicitly passed user count
  if (affectedUserCount !== undefined) {
    if (affectedUserCount >= 3) return MAX_POINTS
    if (affectedUserCount === 2) return MAX_POINTS * 0.7
    return MAX_POINTS * 0.4
  }

  // Check if insight mentions "shared" in explanation
  if (insight.explanation.toLowerCase().includes('shared')) {
    return MAX_POINTS * 0.8
  }

  // Critical insights likely affect everyone
  if (insight.severity === 'critical') {
    return MAX_POINTS * 0.6
  }

  // Default: Single user impact
  return MAX_POINTS * 0.4
}

/**
 * Batch score multiple insights and sort by priority
 *
 * @param insights - Array of insights to score
 * @param context - Scoring context
 * @returns Insights sorted by score (highest first)
 */
export function scoreAndSortInsights(
  insights: Insight[],
  context: {
    daysLeftInMonth: number
    totalBudget?: number
    affectedUserCount?: number
  }
): Insight[] {
  // Add scores to each insight
  const scoredInsights = insights.map((insight) => ({
    ...insight,
    score: calculateInsightScore(insight, context),
  }))

  // Sort by score (descending)
  return scoredInsights.sort((a, b) => b.score - a.score)
}

/**
 * Select the hero insight (highest priority, most critical)
 *
 * @param insights - Array of scored insights
 * @returns The insight that should be displayed in the hero card
 */
export function selectHeroInsight(insights: Insight[]): Insight | null {
  if (insights.length === 0) return null

  // Find highest scoring critical insight
  const critical = insights
    .filter((i) => i.severity === 'critical')
    .sort((a, b) => b.score - a.score)

  if (critical.length > 0) return critical[0]

  // Find highest scoring warning insight
  const warnings = insights
    .filter((i) => i.severity === 'warning')
    .sort((a, b) => b.score - a.score)

  if (warnings.length > 0) return warnings[0]

  // Find highest scoring positive insight
  const positive = insights
    .filter((i) => i.severity === 'positive')
    .sort((a, b) => b.score - a.score)

  if (positive.length > 0) return positive[0]

  // Fallback: Highest scoring insight overall
  return insights.sort((a, b) => b.score - a.score)[0]
}

/**
 * Create a default "all clear" insight when no issues found
 */
export function createDefaultHeroInsight(totalSpent: number, budgetUsedPercent: number): Insight {
  return {
    id: 'default-hero',
    type: 'positive_feedback',
    severity: 'positive',
    title: "You're on track! 🎯",
    explanation: `Your spending is well-controlled this month. You've used ${budgetUsedPercent}% of your budget with ${formatCurrency(totalSpent)} spent. Keep up the great work!`,
    score: 30,
    metric: {
      current: totalSpent,
      percentUsed: budgetUsedPercent,
    },
    cta: {
      text: 'View Budget Details',
      href: '/budgets',
    },
  }
}

/**
 * Format currency for display in insights
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
