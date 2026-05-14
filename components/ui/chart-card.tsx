import * as React from "react"
import { cn } from "@/lib/utils"

export interface ChartCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  toolbar?: React.ReactNode
  footer?: React.ReactNode
}

export function ChartCard({
  title,
  description,
  toolbar,
  footer,
  className,
  children,
  ...props
}: ChartCardProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-xl border border-stone-200 bg-card elevation-rest dark:border-stone-800",
        className
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 text-sm text-stone-600 dark:text-stone-400">
              {description}
            </p>
          )}
        </div>
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </header>
      <div className="flex-1 p-5">{children}</div>
      {footer && (
        <footer className="border-t border-stone-200 px-5 py-3 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-400">
          {footer}
        </footer>
      )}
    </section>
  )
}
