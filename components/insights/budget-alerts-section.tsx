/**
 * Budget Alerts Section Component
 *
 * Displays budget-related insights (over budget, approaching budget, on track).
 * Includes actionable suggestions and CTAs for each alert.
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import type { Insight } from '@/lib/types/insights'
import { formatCurrency, categories } from '@/lib/utils'

interface BudgetAlertsSectionProps {
  insights: Insight[]
}

export function BudgetAlertsSection({ insights }: BudgetAlertsSectionProps) {
  // Filter for budget alerts only
  const budgetAlerts = insights.filter((i) => i.type === 'budget_alert')

  if (budgetAlerts.length === 0) {
    return <EmptyState />
  }

  // Count alerts by severity
  const criticalCount = budgetAlerts.filter((i) => i.severity === 'critical').length
  const warningCount = budgetAlerts.filter((i) => i.severity === 'warning').length

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-stone-700">Budget Alerts</h3>
        {(criticalCount > 0 || warningCount > 0) && (
          <Badge variant="destructive" className="text-sm">
            {criticalCount + warningCount} Active
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {budgetAlerts.map((alert) => (
          <BudgetAlertCard key={alert.id} insight={alert} />
        ))}
      </div>
    </section>
  )
}

/**
 * Budget Alert Card Component
 */
interface BudgetAlertCardProps {
  insight: Insight
}

function BudgetAlertCard({ insight }: BudgetAlertCardProps) {
  const config = getSeverityConfig(insight.severity)

  // Get category info
  const categoryInfo = categories.find((c) => c.value === insight.category)
  const categoryEmoji = getCategoryEmoji(insight.category || '')

  const percentUsed = insight.metric?.percentUsed || 0
  const spent = insight.metric?.current || 0
  const budget = insight.metric?.budget || 0
  const remaining = budget - spent

  return (
    <Card
      className={`${config.gradient} ${config.border} shadow-md hover:shadow-lg transition-shadow`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          {/* Category Icon + Name */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryEmoji}</span>
            <div>
              <CardTitle className="text-lg text-stone-900">
                {categoryInfo?.label || insight.category}
              </CardTitle>
              <CardDescription className="text-sm text-stone-600">
                {formatCurrency(spent)} / {formatCurrency(budget)} budget
              </CardDescription>
            </div>
          </div>

          {/* Over-budget badge */}
          {percentUsed > 100 && (
            <Badge variant="destructive" className="text-xs">
              {Math.round(percentUsed - 100)}% over
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress
            value={Math.min(percentUsed, 100)}
            className="h-2"
            indicatorClassName={config.progressColor}
          />
          <p className="text-xs text-stone-600">
            {percentUsed > 100 ? (
              <>
                <span className={config.textColor}>
                  {formatCurrency(Math.abs(remaining))} over budget
                </span>
              </>
            ) : (
              <>{formatCurrency(remaining)} remaining</>
            )}
          </p>
        </div>

        {/* Explanation */}
        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-stone-200">
          <p className="text-sm text-stone-700 leading-relaxed">
            {insight.explanation}
          </p>
        </div>

        {/* Action Steps (if available) */}
        {insight.actionSteps && insight.actionSteps.length > 0 && (
          <div className="bg-white/70 backdrop-blur rounded-lg p-3 border border-stone-200">
            <div className="flex items-center gap-1 mb-2">
              <Lightbulb className="h-4 w-4 text-amber-600" />
              <p className="text-xs font-semibold text-stone-800">Suggestions:</p>
            </div>
            <ul className="space-y-1 text-xs text-stone-700">
              {insight.actionSteps.slice(0, 2).map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 flex-shrink-0">•</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        {insight.cta && (
          <div className="flex gap-2 pt-2">
            <Link href={insight.cta.href} className="flex-1">
              <Button
                size="sm"
                className={`w-full ${config.buttonBg} hover:opacity-90 transition-all duration-200`}
              >
                {insight.cta.text}
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Empty State when no budget alerts
 */
function EmptyState() {
  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-bold text-stone-700">Budget Alerts</h3>

      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 shadow-md">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="p-4 rounded-full bg-emerald-100 mb-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-stone-900 mb-2">
            All Budgets on Track! 🎉
          </h3>
          <p className="text-stone-600 max-w-md">
            You're staying within your spending limits this month. Keep up the great work!
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

/**
 * Get visual configuration based on severity
 */
function getSeverityConfig(severity: string) {
  switch (severity) {
    case 'critical':
      return {
        gradient: 'bg-gradient-to-br from-red-50 to-orange-50',
        border: 'border-red-200/50',
        progressColor: 'bg-red-600',
        textColor: 'text-red-700',
        buttonBg: 'bg-red-600',
      }

    case 'warning':
      return {
        gradient: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-200/50',
        progressColor: 'bg-amber-600',
        textColor: 'text-amber-700',
        buttonBg: 'bg-amber-600',
      }

    case 'positive':
      return {
        gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        border: 'border-emerald-200/50',
        progressColor: 'bg-emerald-600',
        textColor: 'text-emerald-700',
        buttonBg: 'bg-emerald-600',
      }

    default:
      return {
        gradient: 'bg-gradient-to-br from-stone-50 to-stone-100',
        border: 'border-stone-200/50',
        progressColor: 'bg-stone-600',
        textColor: 'text-stone-700',
        buttonBg: 'bg-stone-700',
      }
  }
}

/**
 * Get emoji for category
 */
function getCategoryEmoji(category: string): string {
  const emojiMap: Record<string, string> = {
    groceries: '🥬',
    dining: '🍽️',
    transportation: '🚗',
    utilities: '💡',
    entertainment: '🎬',
    healthcare: '🏥',
    shopping: '🛍️',
    subscriptions: '💳',
    travel: '✈️',
    household: '🏠',
    'personal-care': '💆',
    pets: '🐾',
    education: '📚',
    gifts: '🎁',
    'home-maintenance': '🔧',
    other: '📦',
  }

  return emojiMap[category.toLowerCase()] || '📊'
}
