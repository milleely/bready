"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, AlertTriangle, Wallet, Bell, TrendingUp } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ContextualAlert {
  id: string
  type: "warning" | "error" | "info"
  message: string
  actionLabel: string
  actionHref: string
  icon: React.ReactNode
}

interface ContextualAlertsProps {
  alerts: ContextualAlert[]
}

export function ContextualAlerts({ alerts }: ContextualAlertsProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])

  // Load dismissed alerts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dismissed-alerts")
    if (stored) {
      try {
        setDismissedAlerts(JSON.parse(stored))
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [])

  const handleDismiss = (alertId: string) => {
    const updated = [...dismissedAlerts, alertId]
    setDismissedAlerts(updated)
    localStorage.setItem("dismissed-alerts", JSON.stringify(updated))
  }

  const visibleAlerts = alerts.filter(
    (alert) => !dismissedAlerts.includes(alert.id)
  )

  if (visibleAlerts.length === 0) return null

  return (
    <div className="space-y-3">
      {visibleAlerts.map((alert) => (
        <Alert
          key={alert.id}
          className={cn(
            "relative pr-12",
            alert.type === "warning" &&
              "border-amber-200 bg-amber-50 text-amber-900",
            alert.type === "error" && "border-red-200 bg-red-50 text-red-900",
            alert.type === "info" && "border-blue-200 bg-blue-50 text-blue-900"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{alert.icon}</div>
            <div className="flex-1 space-y-2">
              <AlertDescription className="text-sm font-medium">
                {alert.message}
              </AlertDescription>
              <Link href={alert.actionHref}>
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "h-8",
                    alert.type === "warning" &&
                      "border-amber-300 hover:bg-amber-100 text-amber-900",
                    alert.type === "error" &&
                      "border-red-300 hover:bg-red-100 text-red-900",
                    alert.type === "info" &&
                      "border-blue-300 hover:bg-blue-100 text-blue-900"
                  )}
                >
                  {alert.actionLabel}
                </Button>
              </Link>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDismiss(alert.id)}
            className="absolute top-2 right-2 h-6 w-6"
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}

// Helper functions to generate specific alerts
export function createOverBudgetAlert(count: number): ContextualAlert {
  return {
    id: "over-budget",
    type: "error",
    message: `⚠️ You're over budget in ${count} ${
      count === 1 ? "category" : "categories"
    }`,
    actionLabel: "Review Budgets",
    actionHref: "/budgets",
    icon: <AlertTriangle className="h-5 w-5 text-red-600" />,
  }
}

export function createPendingSettlementsAlert(
  count: number
): ContextualAlert {
  return {
    id: "pending-settlements",
    type: "warning",
    message: `💰 You have ${count} pending ${
      count === 1 ? "settlement" : "settlements"
    }`,
    actionLabel: "Settle Now",
    actionHref: "/settlements",
    icon: <Wallet className="h-5 w-5 text-amber-600" />,
  }
}

export function createRecurringExpensesDueAlert(
  count: number
): ContextualAlert {
  return {
    id: "recurring-due",
    type: "info",
    message: `🔔 ${count} recurring ${
      count === 1 ? "expense" : "expenses"
    } due this week`,
    actionLabel: "View Recurring",
    actionHref: "/expenses",
    icon: <Bell className="h-5 w-5 text-blue-600" />,
  }
}

export function createInactivityAlert(days: number): ContextualAlert {
  return {
    id: "inactivity-reminder",
    type: "info",
    message: `📊 No expenses logged in ${days} ${days === 1 ? "day" : "days"}`,
    actionLabel: "Add Expense",
    actionHref: "/expenses",
    icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
  }
}
