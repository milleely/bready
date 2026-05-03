import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className
      )}
      {...props}
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-stone-800 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-stone-600 sm:text-base">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  )
}
