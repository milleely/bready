"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, categories } from "@/lib/utils"
import { Target } from "lucide-react"

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
}

export function BudgetProgress({ budgets, spendingByCategory }: BudgetProgressProps) {
  if (budgets.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Budget Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.map((budget) => {
            const categoryInfo = categories.find(c => c.value === budget.category)
            const spent = spendingByCategory.find(s => s.category === budget.category)?.amount || 0
            const percentage = Math.min((spent / budget.amount) * 100, 100)
            const isOverBudget = spent > budget.amount

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: categoryInfo?.color || '#78716c' }}
                    />
                    <span className="font-medium">{categoryInfo?.label || budget.category}</span>
                  </div>
                  <span className={isOverBudget ? "text-red-600 font-semibold" : "text-muted-foreground"}>
                    {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOverBudget
                        ? "bg-red-500"
                        : percentage > 80
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                {isOverBudget && (
                  <p className="text-xs text-red-600 font-medium">
                    Over budget by {formatCurrency(spent - budget.amount)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
