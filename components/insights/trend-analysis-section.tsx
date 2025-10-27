/**
 * Trend Analysis Section Component
 *
 * Displays month-over-month spending trends and category-level insights.
 * Shows changes with visual indicators and contextual explanations.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { Insight } from '@/lib/types/insights'
import { formatCurrency, categories } from '@/lib/utils'

interface TrendAnalysisSectionProps {
  insights: Insight[]
}

export function TrendAnalysisSection({ insights }: TrendAnalysisSectionProps) {
  // Filter for trend analysis insights only
  const trendInsights = insights.filter((i) => i.type === 'trend_analysis')

  if (trendInsights.length === 0) {
    return null // Don't show section if no trends
  }

  return (
    <section className="space-y-4">
      <h3 className="text-2xl font-bold text-stone-700">Spending Trends</h3>

      <div className="grid md:grid-cols-2 gap-4">
        {trendInsights.map((trend) => (
          <TrendInsightCard key={trend.id} insight={trend} />
        ))}
      </div>
    </section>
  )
}

/**
 * Trend Insight Card Component
 */
interface TrendInsightCardProps {
  insight: Insight
}

function TrendInsightCard({ insight }: TrendInsightCardProps) {
  const config = getSeverityConfig(insight.severity)

  // Get category info
  const categoryInfo = categories.find((c) => c.value === insight.category)
  const categoryEmoji = getCategoryEmoji(insight.category || '')

  const current = insight.metric?.current || 0
  const previous = insight.metric?.previous || 0
  const changePercent = insight.metric?.changePercent || 0
  const isIncrease = changePercent > 0

  return (
    <Card
      className={`${config.gradient} ${config.border} shadow-md hover:shadow-lg transition-shadow`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {insight.category && (
            <span className="text-2xl">{categoryEmoji}</span>
          )}
          <CardTitle className="text-lg text-stone-900">
            {insight.title}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metric Comparison */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-stone-900">
            {formatCurrency(current)}
          </span>
          <Badge
            variant={isIncrease ? 'destructive' : 'secondary'}
            className={`text-xs ${config.badgeBg}`}
          >
            {isIncrease ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            {isIncrease ? '+' : ''}
            {changePercent.toFixed(0)}% vs last month
          </Badge>
        </div>

        {/* Previous Value */}
        {previous > 0 && (
          <div className="text-sm text-stone-600">
            Last month: {formatCurrency(previous)}
          </div>
        )}

        {/* Explanation */}
        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-stone-200">
          <p className="text-sm text-stone-700 leading-relaxed">
            {insight.explanation}
          </p>
        </div>

        {/* Context Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200">
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <Calendar className="h-3 w-3" />
            <span>Month-over-month</span>
          </div>

          {insight.cta && (
            <Link href={insight.cta.href}>
              <button
                className={`text-xs font-medium ${config.linkColor} hover:underline`}
              >
                {insight.cta.text} →
              </button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
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
        badgeBg: 'bg-red-100 text-red-900',
        linkColor: 'text-red-700',
      }

    case 'warning':
      return {
        gradient: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-200/50',
        badgeBg: 'bg-amber-100 text-amber-900',
        linkColor: 'text-amber-700',
      }

    case 'positive':
      return {
        gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        border: 'border-emerald-200/50',
        badgeBg: 'bg-emerald-100 text-emerald-900',
        linkColor: 'text-emerald-700',
      }

    case 'info':
    default:
      return {
        gradient: 'bg-gradient-to-br from-stone-50 to-stone-100',
        border: 'border-stone-200/50',
        badgeBg: 'bg-stone-100 text-stone-900',
        linkColor: 'text-stone-700',
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
