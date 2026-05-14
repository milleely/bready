import * as React from "react"
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export type TrendDirection = "up" | "down" | "flat"

export interface TrendBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  direction: TrendDirection
  delta: string
  /**
   * For spending/cost metrics, an upward trend is *bad* — set this to swap
   * the success/danger color mapping.
   */
  invertSemantics?: boolean
  period?: string
  size?: "sm" | "md"
}

function toneFor(direction: TrendDirection, invert: boolean): {
  text: string
  bg: string
  Icon: typeof ArrowUpRight
} {
  if (direction === "flat") {
    return {
      text: "text-stone-600 dark:text-stone-400",
      bg: "bg-stone-100 dark:bg-stone-800/60",
      Icon: Minus,
    }
  }

  const isUp = direction === "up"
  const isGood = invert ? !isUp : isUp

  if (isGood) {
    return {
      text: "text-emerald-700 dark:text-emerald-300",
      bg: "bg-emerald-50 dark:bg-emerald-950/40",
      Icon: isUp ? ArrowUpRight : ArrowDownRight,
    }
  }

  return {
    text: "text-rose-700 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    Icon: isUp ? ArrowUpRight : ArrowDownRight,
  }
}

export function TrendBadge({
  direction,
  delta,
  invertSemantics = false,
  period,
  size = "md",
  className,
  ...props
}: TrendBadgeProps) {
  const { text, bg, Icon } = toneFor(direction, invertSemantics)
  const sizing =
    size === "sm"
      ? "px-2 py-0.5 text-xs gap-1 [&_svg]:h-3 [&_svg]:w-3"
      : "px-2.5 py-1 text-sm gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5"

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium tabular-nums",
        sizing,
        text,
        bg,
        className
      )}
      {...props}
    >
      <Icon aria-hidden="true" />
      <span>{delta}</span>
      {period && (
        <span className="font-normal opacity-75">· {period}</span>
      )}
    </span>
  )
}
