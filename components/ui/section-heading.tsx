import * as React from "react"
import { cn } from "@/lib/utils"

export interface SectionHeadingProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  as?: "h2" | "h3"
}

export function SectionHeading({
  title,
  description,
  actions,
  as: Tag = "h2",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <Tag
          className={cn(
            "font-display font-semibold text-stone-900 dark:text-stone-100",
            Tag === "h2" ? "text-xl" : "text-lg"
          )}
        >
          {title}
        </Tag>
        {description && (
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}
