"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react"
import type { Insight, InsightSeverity } from "@/lib/types/insights"
import Link from "next/link"

/**
 * Compact Insight Card Component
 *
 * Displays a single financial insight in a condensed format
 * optimized for showing 3 cards side-by-side.
 */

interface InsightCardCompactProps {
  insight: Insight
}

// Severity configuration for visual styling
const SEVERITY_CONFIG: Record<
  InsightSeverity,
  {
    icon: typeof AlertTriangle
    badgeClass: string
    cardClass: string
    iconClass: string
    label: string
  }
> = {
  critical: {
    icon: AlertTriangle,
    badgeClass: "bg-red-100 text-red-800 border-red-200",
    cardClass: "border-red-200/50 bg-gradient-to-br from-red-50 to-orange-50",
    iconClass: "text-red-600 bg-red-100",
    label: "Urgent",
  },
  warning: {
    icon: AlertCircle,
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    cardClass: "border-amber-200/50 bg-gradient-to-br from-amber-50 to-yellow-50",
    iconClass: "text-amber-600 bg-amber-100",
    label: "Warning",
  },
  info: {
    icon: Info,
    badgeClass: "bg-stone-100 text-stone-800 border-stone-200",
    cardClass: "border-stone-200/50 bg-gradient-to-br from-stone-50 to-stone-100",
    iconClass: "text-stone-600 bg-stone-100",
    label: "Info",
  },
  positive: {
    icon: CheckCircle2,
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cardClass: "border-emerald-200/50 bg-gradient-to-br from-emerald-50 to-teal-50",
    iconClass: "text-emerald-600 bg-emerald-100",
    label: "Good News",
  },
}

export function InsightCardCompact({ insight }: InsightCardCompactProps) {
  const config = SEVERITY_CONFIG[insight.severity]
  const Icon = config.icon

  // Truncate explanation to first sentence for compact view
  const compactExplanation = insight.explanation.split(".")[0] + "."

  return (
    <Card className={`${config.cardClass} border shadow-lg transition-all duration-200 hover:shadow-xl`}>
      <CardContent className="pt-6 flex flex-col min-h-[380px]">
        {/* Header: Icon + Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`p-2.5 rounded-lg ${config.iconClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          <Badge variant="outline" className={`${config.badgeClass} text-xs font-medium`}>
            {config.label}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-stone-900 leading-tight mb-4">
          {insight.title}
        </h3>

        {/* Explanation */}
        <p className="text-sm text-stone-700 leading-relaxed line-clamp-2 mb-4">
          {compactExplanation}
        </p>

        {/* Metric Display (if available) */}
        {insight.metric && (
          <div className="pt-2 space-y-1 mb-4">
            {/* Current Value */}
            <div className="flex items-baseline gap-2">
              <DollarSign className="h-4 w-4 text-stone-600" />
              <span className="text-2xl font-bold text-stone-900">
                ${insight.metric.current.toLocaleString()}
              </span>
              {insight.metric.budget && (
                <span className="text-sm text-stone-600">
                  / ${insight.metric.budget.toLocaleString()}
                </span>
              )}
            </div>

            {/* Change Indicator */}
            {insight.metric.changePercent !== undefined && insight.metric.changePercent !== 0 && (
              <div className="flex items-center gap-1 text-sm">
                {insight.metric.changePercent > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5 text-red-600" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
                )}
                <span
                  className={`font-medium ${
                    insight.metric.changePercent > 0 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {insight.metric.changePercent > 0 ? "+" : ""}
                  {insight.metric.changePercent.toFixed(1)}% vs last month
                </span>
              </div>
            )}
          </div>
        )}

        {/* CTA Button (if available) - pushed to bottom with mt-auto */}
        {insight.cta && (
          <div className="mt-auto pt-2">
            <Link href={insight.cta.href}>
              <Button
                variant="default"
                size="sm"
                className="w-full bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg"
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
