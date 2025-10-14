"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, categories } from "@/lib/utils"
import { Target, AlertTriangle, CheckCircle2, AlertCircle, Trash2, Pencil } from "lucide-react"

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

interface Expense {
  id: string
  amount: number
  category: string
  userId: string
  isShared: boolean
}

interface User {
  id: string
  name: string
  email: string | null
  color: string
}

interface BudgetProgressProps {
  budgets: Budget[]
  expenses: Expense[]
  spendingByCategory: CategorySpending[]
  users: User[]
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => Promise<void>
}

export function EnhancedBudgetProgress({ budgets, expenses, spendingByCategory, users, onEdit, onDelete }: BudgetProgressProps) {
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
            const budgetUser = budget.userId ? users.find(u => u.id === budget.userId) : null

            // Calculate spent amount based on budget type
            let spent = 0
            if (budget.userId) {
              // Personal budget: filter expenses by userId AND category
              spent = expenses
                .filter(e => e.userId === budget.userId && e.category === budget.category)
                .reduce((sum, e) => sum + e.amount, 0)
            } else {
              // Shared budget: use total spending for this category
              spent = spendingByCategory.find(s => s.category === budget.category)?.amount || 0
            }

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
                      {/* User/Shared indicator badge */}
                      <div className="mt-1 mb-1">
                        {budgetUser ? (
                          <Badge variant="outline" className="text-xs px-2 py-0.5 border-gray-300 bg-white inline-flex items-center">
                            <div
                              className="h-2 w-2 rounded-full mr-1.5"
                              style={{ backgroundColor: budgetUser.color }}
                            />
                            {budgetUser.name}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 inline-flex items-center">
                            Shared
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(budget)}
                      className="h-11 w-11 hover:bg-amber-100 text-golden-crust-primary hover:text-golden-crust-dark"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(budget.id)}
                      className="h-11 w-11 hover:bg-red-100 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
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
