"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, categories } from "@/lib/utils"
import { Target, AlertTriangle, CheckCircle2, AlertCircle, Trash2 } from "lucide-react"

interface Budget {
  id: string
  category: string
  amount: number
  month: string
  userId: string | null
}

interface CategorySpending {
  category: string
  amount: number
}

interface BudgetProgressProps {
  budgets: Budget[]
  spendingByCategory: CategorySpending[]
  onDelete: (id: string) => Promise<void>
}

export function EnhancedBudgetProgress({ budgets, spendingByCategory, onDelete }: BudgetProgressProps) {
  if (budgets.length === 0) {
    return null
  }

  const getBudgetStatus = (percentage: number, isOverBudget: boolean, categoryColor: string) => {
    if (isOverBudget) {
      return {
        color: "destructive" as const,
        icon: AlertTriangle,
        label: "Over Budget",
        progressColor: "bg-red-500",
        bgColor: categoryColor
      }
    }
    if (percentage > 80) {
      return {
        color: "outline" as const,
        icon: AlertCircle,
        label: "Warning",
        progressColor: "bg-amber-500",
        bgColor: categoryColor
      }
    }
    return {
      color: "secondary" as const,
      icon: CheckCircle2,
      label: "On Track",
        progressColor: "bg-green-500",
      bgColor: categoryColor
    }
  }

  return (
    <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-golden-crust-dark">
          <Target className="h-5 w-5" />
          Budget Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const categoryInfo = categories.find(c => c.value === budget.category)
            const spent = spendingByCategory.find(s => s.category === budget.category)?.amount || 0
            const percentage = Math.min((spent / budget.amount) * 100, 100)
            const isOverBudget = spent > budget.amount
            const remaining = budget.amount - spent
            const categoryColor = categoryInfo?.color || '#78716c'
            const status = getBudgetStatus(percentage, isOverBudget, categoryColor)
            const StatusIcon = status.icon

            return (
              <div key={budget.id} className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center shadow-sm"
                      style={{ backgroundColor: categoryInfo?.color || '#78716c' }}
                    >
                      <span className="text-white text-xl">
                        {categoryInfo?.icon || "🍞"}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base">
                        {categoryInfo?.label || budget.category}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(budget.id)}
                    className="h-11 w-11 hover:bg-red-100 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 ease-out rounded-full"
                        style={{
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: isOverBudget ? '#ef4444' : categoryColor
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      {percentage.toFixed(0)}% used
                    </span>
                    {isOverBudget ? (
                      <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                        {formatCurrency(Math.abs(remaining))} over budget
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-green-600">
                        {formatCurrency(remaining)} remaining
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
