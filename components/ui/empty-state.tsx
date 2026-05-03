import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 sm:py-16",
        className
      )}
      {...props}
    >
      {Icon && (
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full surface-card-subtle elevation-rest text-amber-700"
          aria-hidden="true"
        >
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-stone-600">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
