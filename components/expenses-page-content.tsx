"use client"

import { Suspense, useEffect, useState, lazy } from "react"
import { EnhancedRecentExpenses } from "@/components/enhanced-recent-expenses"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { ChevronDown, ChevronUp, BarChart3, Plus } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// Lazy load heavy components (only when needed)
const EnhancedSpendingCharts = lazy(() => import("@/components/enhanced-spending-charts").then(mod => ({ default: mod.EnhancedSpendingCharts })))
const ExpenseForm = lazy(() => import("@/components/expense-form").then(mod => ({ default: mod.ExpenseForm })))

interface User {
  id: string
  name: string
  email: string | null
  color: string
}

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: Date | string
  isShared: boolean
  userId: string
  recurringExpenseId?: string | null
  user: User
}

interface Stats {
  totalSpent: number
  sharedExpenses: number
  spendingPerPerson: Array<{
    userId: string
    name: string
    color: string
    total: number
    shared: number
    personal: number
    recurringCount: number
  }>
  spendingByCategory: Array<{ category: string; amount: number }>
}

interface ExpensesPageContentProps {
  month?: string
}

export function ExpensesPageContent({ month }: ExpensesPageContentProps) {
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [optimisticExpenses, setOptimisticExpenses] = useState<Expense[]>([])
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalSpent: 0,
    sharedExpenses: 0,
    spendingPerPerson: [],
    spendingByCategory: [],
  })
  const [analyticsOpen, setAnalyticsOpen] = useState(() => {
    // Load from localStorage or default to true
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('expenses-analytics-open')
      return stored !== null ? stored === 'true' : true
    }
    return true
  })
  const [addingExpense, setAddingExpense] = useState(false)

  // Filter state
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'all' | 'shared' | 'personal'>('all')
  const [selectedRecurring, setSelectedRecurring] = useState<'all' | 'recurring' | 'one-time'>('all')
  const [minAmount, setMinAmount] = useState<number | null>(null)
  const [maxAmount, setMaxAmount] = useState<number | null>(null)

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

  // 🚀 PERFORMANCE: Fetch users once on mount (users don't change during session)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRes = await fetch('/api/users')
        const usersData = await usersRes.json()
        setUsers(usersData)
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])

  // 🚀 PERFORMANCE: Fetch stats only when month changes (stats don't depend on filters)
  const fetchStats = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const statsRes = await fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`)
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [selectedMonth])

  // 🚀 PERFORMANCE: Only fetch expenses when month or filters change (150-200ms → 50-100ms per filter)
  const fetchData = async () => {
    try {
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      // Build query with filters
      let query = `startDate=${startDate}&endDate=${endDate}`
      if (selectedUser) query += `&userId=${selectedUser}`
      if (selectedCategory) query += `&category=${selectedCategory}`
      if (selectedType !== 'all') query += `&isShared=${selectedType === 'shared'}`
      if (selectedRecurring !== 'all') query += `&isRecurring=${selectedRecurring === 'recurring'}`
      if (minAmount !== null) query += `&minAmount=${minAmount}`
      if (maxAmount !== null) query += `&maxAmount=${maxAmount}`

      const expensesRes = await fetch(`/api/expenses?${query}`)
      const expensesData = await expensesRes.json()
      setExpenses(expensesData)
    } catch (error) {
      console.error('Failed to fetch expenses data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedUser, selectedCategory, selectedType, selectedRecurring, minAmount, maxAmount])

  // Listen for expense added event from sidebar
  useEffect(() => {
    const handleExpenseAdded = async () => {
      await fetchData()
      await fetchStats()
    }

    window.addEventListener('expenseAdded', handleExpenseAdded)
    return () => window.removeEventListener('expenseAdded', handleExpenseAdded)
  }, [selectedMonth, selectedUser, selectedCategory, selectedType, selectedRecurring, minAmount, maxAmount])

  // Persist analytics open state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('expenses-analytics-open', String(analyticsOpen))
    }
  }, [analyticsOpen])

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await fetchData()
      await fetchStats()
      window.dispatchEvent(new CustomEvent('expenseDeleted'))
    }
  }

  const handleDeleteRecurringSeries = async (recurringId: string, fromDate: Date | string) => {
    if (!confirm('Delete all future occurrences of this recurring expense?\n\nNote: Recurring expenses cannot be edited. To change this expense, delete it and create a new one.\n\n(Past expenses will be kept as history)')) return

    // Pass the expense date as query parameter to use as cutoff
    const dateParam = new Date(fromDate).toISOString()
    const response = await fetch(`/api/recurring-expenses/${recurringId}?fromDate=${dateParam}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await fetchData()
      await fetchStats()
      window.dispatchEvent(new CustomEvent('expenseDeleted'))
    } else {
      const error = await response.json()
      toast.error(`Failed to delete recurring series: ${error.error || 'Unknown error'}`)
    }
  }

  const handleEditExpense = async (expense: Omit<Expense, 'id' | 'user'>) => {
    if (!editingExpense) return

    const response = await fetch(`/api/expenses/${editingExpense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })

    if (response.ok) {
      setEditingExpense(undefined)
      await fetchData()
      await fetchStats()
      window.dispatchEvent(new CustomEvent('expenseEdited'))
    }
  }

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'user'>) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const user = users.find(u => u.id === expense.userId)

    if (!user) {
      throw new Error('User not found. Please refresh the page and try again.')
    }

    // Create optimistic expense
    const optimisticExpense: Expense = {
      id: tempId,
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: expense.date,
      isShared: expense.isShared,
      userId: expense.userId,
      recurringExpenseId: expense.recurringExpenseId || null,
      user: user,
    }

    // Add optimistically (shows immediately in UI)
    setOptimisticExpenses(prev => [optimisticExpense, ...prev])

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      })

      if (response.ok) {
        // Success: refresh real data and remove temp expense
        await fetchData()
        await fetchStats()
        setOptimisticExpenses(prev => prev.filter(e => e.id !== tempId))
      } else {
        // Parse error response from API
        const errorData = await response.json()
        const errorMessage = errorData.error || `Server error (${response.status})`

        // Rollback optimistic update
        setOptimisticExpenses(prev => prev.filter(e => e.id !== tempId))

        // Throw error with descriptive message for expense-form to display
        throw new Error(errorMessage)
      }
    } catch (error) {
      // Rollback: remove optimistic expense
      setOptimisticExpenses(prev => prev.filter(e => e.id !== tempId))

      // Re-throw error so expense-form can display it
      throw error
    }
  }

  const clearAllFilters = () => {
    setSelectedUser(null)
    setSelectedCategory(null)
    setSelectedType('all')
    setSelectedRecurring('all')
    setMinAmount(null)
    setMaxAmount(null)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (selectedUser) count++
    if (selectedCategory) count++
    if (selectedType !== 'all') count++
    if (selectedRecurring !== 'all') count++
    if (minAmount !== null) count++
    if (maxAmount !== null) count++
    return count
  }

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-busy="true">
        <span className="sr-only">Loading expenses</span>
        {/* PageHeader skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Collapsible Spending Analytics card — header + 2-col chart cards inside */}
        <div className="rounded-xl border border-stone-200 bg-card shadow-sm dark:border-stone-800">
          <div className="flex items-center justify-between p-6 pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-sm" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </div>
          <div className="grid gap-4 p-6 pt-0 sm:gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-stone-200 bg-card dark:border-stone-800"
              >
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
                  <div className="space-y-1.5 min-w-0">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-3 w-56" />
                  </div>
                </div>
                <div className="p-5">
                  <Skeleton className="aspect-square w-full max-w-[260px] mx-auto rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses card — header (title + export button) + filter row + table */}
        <div className="rounded-xl border border-stone-200 bg-card shadow-sm dark:border-stone-800">
          <div className="flex flex-row items-center justify-between p-6 pb-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
            <Skeleton className="h-9 w-28 rounded-md" />
          </div>
          <div className="space-y-4 px-6 pb-6">
            {/* Filter button row */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            {/* Table header row */}
            <div className="hidden md:grid grid-cols-[100px_1fr_70px_120px_110px_90px_90px_40px] items-center gap-3 border-b border-stone-200 pb-2 dark:border-stone-800">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-full" />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto] md:grid-cols-[100px_1fr_70px_120px_110px_90px_90px_40px] items-center gap-3"
              >
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full hidden md:block" />
                <Skeleton className="h-6 w-6 rounded-sm hidden md:block" />
                <Skeleton className="h-6 w-24 rounded-full hidden md:block" />
                <div className="flex items-center gap-2 hidden md:flex">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full hidden md:block" />
                <Skeleton className="h-4 w-16 ml-auto hidden md:block tabular-nums" />
                <Skeleton className="h-6 w-6 rounded-full ml-auto hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getMonthName(selectedMonth)} expenses`}
        description="Every expense, every month."
      />

      {/* Collapsible Analytics Section */}
      <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <Card className="border-stone-200 bg-card dark:border-stone-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <CardTitle className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">Spending analytics</CardTitle>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-stone-100 dark:hover:bg-stone-800">
                  {analyticsOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                  </div>
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                  </div>
                </div>
              }>
                <EnhancedSpendingCharts
                  spendingByCategory={stats.spendingByCategory}
                  spendingPerPerson={stats.spendingPerPerson}
                />
              </Suspense>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <EnhancedRecentExpenses
        expenses={[...optimisticExpenses, ...expenses]}
        users={users}
        onEdit={(expense) => {
          // Prevent editing optimistic expenses
          if (expense.id.startsWith('temp-')) return
          setEditingExpense(expense)
        }}
        onDelete={(id) => {
          // Prevent deleting optimistic expenses
          if (id.startsWith('temp-')) return
          handleDeleteExpense(id)
        }}
        onDeleteRecurring={(recurringId, fromDate) => {
          handleDeleteRecurringSeries(recurringId, fromDate)
        }}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedRecurring={selectedRecurring}
        setSelectedRecurring={setSelectedRecurring}
        minAmount={minAmount}
        setMinAmount={setMinAmount}
        maxAmount={maxAmount}
        setMaxAmount={setMaxAmount}
        activeFilterCount={getActiveFilterCount()}
        onClearAllFilters={clearAllFilters}
        optimisticIds={optimisticExpenses.map(e => e.id)}
      />

      {/* Add Expense Form */}
      {addingExpense && (
        <Suspense fallback={null}>
          <ExpenseForm
            users={users}
            onSubmit={async (expense) => {
              await handleAddExpense(expense)
              setAddingExpense(false)
            }}
            onSaveAndAddAnother={async (expense) => {
              // handleAddExpense throws on error so the form's catch handles
              // toast + keep-open. Success path lets the form do the partial
              // reset + focus rather than us closing the dialog.
              await handleAddExpense(expense)
            }}
            open={addingExpense}
            onOpenChange={setAddingExpense}
          />
        </Suspense>
      )}

      {/* Edit Expense Form */}
      {editingExpense && (
        <Suspense fallback={null}>
          <ExpenseForm
            users={users}
            expense={editingExpense}
            onSubmit={handleEditExpense}
            open={!!editingExpense}
            onOpenChange={(open) => {
              if (!open) {
                setEditingExpense(undefined)
              }
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
