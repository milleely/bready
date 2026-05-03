"use client"

import { Suspense, useEffect, useState, lazy } from "react"
import { EnhancedBudgetProgress } from "@/components/enhanced-budget-progress"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Target } from "lucide-react"

// Lazy load dialog component (only when opened)
const BudgetDialog = lazy(() => import("@/components/budget-dialog").then(mod => ({ default: mod.BudgetDialog })))

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

  // Listen for expense changes from other pages
  useEffect(() => {
    const handleExpenseChange = () => {
      fetchData()
    }

    window.addEventListener('expenseAdded', handleExpenseChange)
    window.addEventListener('expenseEdited', handleExpenseChange)
    window.addEventListener('expenseDeleted', handleExpenseChange)

    return () => {
      window.removeEventListener('expenseAdded', handleExpenseChange)
      window.removeEventListener('expenseEdited', handleExpenseChange)
      window.removeEventListener('expenseDeleted', handleExpenseChange)
    }
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="hidden md:block h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl surface-card-subtle elevation-rest p-5 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{getMonthName(selectedMonth)} Budgets</h1>
          <p className="hidden md:block text-muted-foreground mt-1">
            Set and track your spending limits for each category.
          </p>
        </div>
        <Suspense fallback={null}>
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
        </Suspense>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No budgets set yet"
          description="Start tracking your spending by setting budgets for different categories."
          action={
            <Suspense fallback={null}>
              <BudgetDialog users={users} onBudgetSet={fetchData} />
            </Suspense>
          }
          className="rounded-xl border-2 border-dashed border-amber-200/60 bg-white"
        />
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
