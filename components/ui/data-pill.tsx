import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface DataPillProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  label: string
  value: string
  tone?: "neutral" | "amber" | "muted"
}

const toneStyles: Record<NonNullable<DataPillProps["tone"]>, string> = {
  neutral: "bg-stone-50 text-stone-700 ring-stone-200 dark:bg-stone-900/60 dark:text-stone-200 dark:ring-stone-700",
  amber:
    "bg-amber-50 dark:bg-amber-950/30 text-amber-900 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900",
  muted:
    "bg-transparent text-stone-600 ring-transparent dark:text-stone-300",
}

export function DataPill({
  icon: Icon,
  label,
  value,
  tone = "neutral",
  className,
  ...props
}: DataPillProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-sm ring-1 ring-inset",
        toneStyles[tone],
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />}
      <span className="font-medium">{label}</span>
      <span className="tabular-nums font-semibold">{value}</span>
    </div>
  )
}
