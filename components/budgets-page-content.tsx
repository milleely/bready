"use client"

import { useEffect, useState } from "react"
import { EnhancedBudgetProgress } from "@/components/enhanced-budget-progress"
import { BudgetDialog } from "@/components/budget-dialog"
import { ContextualAlerts, createOverBudgetAlert } from "@/components/contextual-alerts"

interface User {
  id: string
  name: string
  email: string | null
  color: string
}

interface Budget {
  id: string
  category: string
  amount: number
  month: string
  userId: string | null
}

interface Expense {
  id: string
  amount: number
  category: string
  userId: string
  isShared: boolean
}

interface CategorySpending {
  category: string
  amount: number
}

interface BudgetsPageContentProps {
  month?: string
}

export function BudgetsPageContent({ month }: BudgetsPageContentProps) {
  const [users, setUsers] = useState<User[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [spendingByCategory, setSpendingByCategory] = useState<CategorySpending[]>([])
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>()
  const [loading, setLoading] = useState(true)

  // Get current month
  const getCurrentMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  }

  // Get selected month from prop or default to current
  const selectedMonth = month || getCurrentMonth()

  // Format month for display (e.g., "September 2024")
  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const fetchData = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const [usersRes, budgetsRes, expensesRes, statsRes] = await Promise.all([
        fetch('/api/users'),
        fetch(`/api/budgets?month=${selectedMonth}`),
        fetch(`/api/expenses?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`),
      ])

      const [usersData, budgetsData, expensesData, statsData] = await Promise.all([
        usersRes.json(),
        budgetsRes.json(),
        expensesRes.json(),
        statsRes.json(),
      ])

      setUsers(usersData)
      setBudgets(budgetsData)
      setExpenses(expensesData)
      setSpendingByCategory(statsData.spendingByCategory || [])
    } catch (error) {
      console.error('Failed to fetch budget data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    const response = await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await fetchData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 bg-amber-200 rounded-full mx-auto"></div>
          </div>
          <p className="text-muted-foreground">Loading budgets...</p>
        </div>
      </div>
    )
  }

  // Calculate over-budget categories
  const overBudgetCount = budgets.filter(budget => {
    const categorySpending = spendingByCategory.find(
      s => s.category === budget.category
    )
    return categorySpending && categorySpending.amount > budget.amount
  }).length

  // Generate contextual alerts
  const alerts = []
  if (overBudgetCount > 0) {
    alerts.push(createOverBudgetAlert(overBudgetCount))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getMonthName(selectedMonth)} Budgets</h1>
          <p className="text-muted-foreground mt-1">
            Set and track your spending limits for each category.
          </p>
        </div>
        <BudgetDialog
          users={users}
          onBudgetSet={fetchData}
          budget={editingBudget}
          {...(editingBudget && {
            open: true,
            onOpenChange: (open: boolean) => {
              if (!open) {
                setEditingBudget(undefined)
              }
            }
          })}
        />
      </div>

      {/* Contextual Alerts */}
      <ContextualAlerts alerts={alerts} />

      {budgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-center p-6">
            <div className="mb-4 text-6xl">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets set yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Start tracking your spending by setting budgets for different categories.
            </p>
            <BudgetDialog
              users={users}
              onBudgetSet={fetchData}
            />
          </div>
        </div>
      ) : (
        <EnhancedBudgetProgress
          budgets={budgets}
          expenses={expenses}
          spendingByCategory={spendingByCategory}
          users={users}
          onEdit={(budget) => setEditingBudget(budget)}
          onDelete={handleDeleteBudget}
        />
      )}
    </div>
  )
}
