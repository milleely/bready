/**
 * Hero Insight Card Component
 *
 * Displays the most important insight with large format and visual emphasis.
 * Adapts styling based on insight severity (critical, warning, info, positive).
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Target,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import type { Insight } from '@/lib/types/insights'
import { formatCurrency } from '@/lib/utils'

interface HeroInsightCardProps {
  insight: Insight
}

export function HeroInsightCard({ insight }: HeroInsightCardProps) {
  const config = getSeverityConfig(insight.severity)

  return (
    <Card
      className={`min-h-[400px] ${config.gradient} ${config.border} shadow-xl transition-shadow hover:shadow-2xl`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          {/* Left: Icon + Status Badge */}
          <div className="flex items-center gap-3">
            <div
              className={`p-4 rounded-2xl ${config.iconBg} backdrop-blur-sm shadow-md`}
            >
              {config.icon}
            </div>
            <Badge
              variant={
                insight.severity === 'critical' || insight.severity === 'warning'
                  ? 'destructive'
                  : 'secondary'
              }
              className={`text-sm ${config.badgeBg}`}
            >
              {config.statusLabel}
            </Badge>
          </div>

          {/* Right: Trend Indicator (if available) */}
          {insight.metric?.changePercent !== undefined && (
            <div className="flex items-center gap-1 text-sm text-stone-600">
              {insight.metric.changePercent > 0 ? (
                <TrendingUp className={`h-4 w-4 ${config.trendColor}`} />
              ) : (
                <TrendingDown className={`h-4 w-4 ${config.trendColor}`} />
              )}
              <span className={`font-semibold ${config.trendColor}`}>
                {insight.metric.changePercent > 0 ? '+' : ''}
                {insight.metric.changePercent.toFixed(0)}%
              </span>
              <span className="text-stone-500">vs last month</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Primary Message */}
        <h2 className="text-4xl font-bold text-stone-900 leading-tight">
          {insight.title}
        </h2>

        {/* Secondary Explanation */}
        <p className="text-lg text-stone-700 leading-relaxed">
          {insight.explanation}
        </p>

        {/* Key Metrics (if available) */}
        {insight.metric && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200">
            {insight.metric.current !== undefined && (
              <MetricPill
                label={insight.metric.budget ? 'Spent' : 'Current'}
                value={formatCurrency(insight.metric.current)}
              />
            )}

            {insight.metric.percentUsed !== undefined && (
              <MetricPill
                label="Budget Used"
                value={`${Math.round(insight.metric.percentUsed)}%`}
                trend={
                  insight.metric.percentUsed > 100
                    ? 'up'
                    : insight.metric.percentUsed < 80
                      ? 'down'
                      : undefined
                }
              />
            )}

            {insight.metric.previous !== undefined && (
              <MetricPill
                label="Last Month"
                value={formatCurrency(insight.metric.previous)}
              />
            )}

            {insight.metric.change !== undefined &&
              insight.metric.previous === undefined && (
                <MetricPill
                  label="Change"
                  value={formatCurrency(Math.abs(insight.metric.change))}
                  trend={insight.metric.change > 0 ? 'up' : 'down'}
                />
              )}
          </div>
        )}

        {/* Action Steps (if available) */}
        {insight.actionSteps && insight.actionSteps.length > 0 && (
          <div className="bg-white/60 backdrop-blur rounded-lg p-4 border border-stone-200">
            <p className="text-sm font-semibold text-stone-800 mb-2">
              Suggested Actions:
            </p>
            <ul className="space-y-1 text-sm text-stone-700">
              {insight.actionSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        {insight.cta && (
          <Link href={insight.cta.href} className="mt-auto">
            <Button
              size="lg"
              className={`w-full ${config.buttonBg} hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg`}
            >
              {insight.cta.text}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Metric Pill Component
 * Displays a single metric with optional trend indicator
 */
interface MetricPillProps {
  label: string
  value: string
  trend?: 'up' | 'down'
}

function MetricPill({ label, value, trend }: MetricPillProps) {
  return (
    <div className="bg-white/70 backdrop-blur rounded-lg p-3 border border-stone-200">
      <p className="text-xs text-stone-600 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-xl font-bold text-stone-900">{value}</p>
        {trend && (
          <span
            className={`text-xs ${
              trend === 'down' ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Get visual configuration based on severity
 */
function getSeverityConfig(severity: 'critical' | 'warning' | 'info' | 'positive') {
  switch (severity) {
    case 'critical':
      return {
        gradient: 'bg-gradient-to-br from-red-50 to-orange-50',
        border: 'border-red-200/50',
        iconBg: 'bg-red-100',
        icon: <AlertTriangle className="h-8 w-8 text-red-700" />,
        badgeBg: 'bg-red-100 text-red-900',
        statusLabel: 'Critical',
        trendColor: 'text-red-700',
        buttonBg: 'bg-red-600',
      }

    case 'warning':
      return {
        gradient: 'bg-gradient-to-br from-amber-50 to-yellow-50',
        border: 'border-amber-200/50',
        iconBg: 'bg-amber-100',
        icon: <AlertCircle className="h-8 w-8 text-amber-700" />,
        badgeBg: 'bg-amber-100 text-amber-900',
        statusLabel: 'Needs Attention',
        trendColor: 'text-amber-700',
        buttonBg: 'bg-amber-600',
      }

    case 'positive':
      return {
        gradient: 'bg-gradient-to-br from-emerald-50 to-teal-50',
        border: 'border-emerald-200/50',
        iconBg: 'bg-emerald-100',
        icon: <CheckCircle2 className="h-8 w-8 text-emerald-700" />,
        badgeBg: 'bg-emerald-100 text-emerald-900',
        statusLabel: 'All Clear',
        trendColor: 'text-emerald-700',
        buttonBg: 'bg-emerald-600',
      }

    case 'info':
    default:
      return {
        gradient: 'bg-gradient-to-br from-stone-50 to-stone-100',
        border: 'border-stone-200/50',
        iconBg: 'bg-stone-100',
        icon: <Target className="h-8 w-8 text-stone-700" />,
        badgeBg: 'bg-stone-100 text-stone-900',
        statusLabel: 'Informational',
        trendColor: 'text-stone-700',
        buttonBg: 'bg-stone-700',
      }
  }
}
