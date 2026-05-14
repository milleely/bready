"use client"

import * as React from "react"
import { animate } from "motion/react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"

export interface AnimatedNumberProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  value: number
  format: (value: number) => string
  duration?: number
}

/**
 * Counts up to `value` over `duration` seconds, formatted on every frame.
 * Honors prefers-reduced-motion (snaps to value instantly).
 *
 *   <AnimatedNumber value={stats.totalSpent} format={formatCurrency} />
 *
 * Renders the formatted final value at SSR/first paint to avoid layout shift
 * — the animation only runs client-side after mount and on subsequent value
 * changes.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 0.6,
  className,
  ...rest
}: AnimatedNumberProps) {
  const reduced = useReducedMotion()
  const ref = React.useRef<HTMLSpanElement>(null)
  const prev = React.useRef<number>(value)

  React.useEffect(() => {
    if (!ref.current) return

    if (reduced) {
      ref.current.textContent = format(value)
      prev.current = value
      return
    }

    const controls = animate(prev.current, value, {
      duration,
      ease: [0.32, 0.72, 0, 1],
      onUpdate(latest) {
        if (ref.current) {
          ref.current.textContent = format(latest)
        }
      },
    })
    prev.current = value
    return () => controls.stop()
  }, [value, reduced, format, duration])

  return (
    <span ref={ref} className={cn("tabular-nums", className)} {...rest}>
      {format(value)}
    </span>
  )
}
