import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TrendBadge, type TrendDirection } from "@/components/ui/trend-badge"

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string
  trend?: {
    direction: TrendDirection
    delta: string
    period?: string
    invertSemantics?: boolean
  }
  icon?: LucideIcon
  tone?: "neutral" | "amber" | "success" | "warning"
}

const toneRing: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "border-stone-200 dark:border-stone-800",
  amber: "border-amber-200 dark:border-amber-900",
  success: "border-emerald-200 dark:border-emerald-900",
  warning: "border-amber-300 dark:border-amber-800",
}

const toneIcon: Record<NonNullable<StatCardProps["tone"]>, string> = {
  neutral: "text-stone-500 dark:text-stone-400",
  amber: "text-amber-600 dark:text-amber-400",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-700 dark:text-amber-500",
}

export function StatCard({
  label,
  value,
  trend,
  icon: Icon,
  tone = "neutral",
  className,
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-card p-5 elevation-rest transition-shadow hover-elevation-hover",
        toneRing[tone],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {label}
        </span>
        {Icon && <Icon className={cn("h-4 w-4", toneIcon[tone])} aria-hidden="true" />}
      </div>
      <div className="font-display text-4xl font-semibold tabular-nums text-stone-900 dark:text-stone-50">
        {value}
      </div>
      {trend && (
        <TrendBadge
          direction={trend.direction}
          delta={trend.delta}
          period={trend.period}
          invertSemantics={trend.invertSemantics}
          size="sm"
        />
      )}
    </div>
  )
}
