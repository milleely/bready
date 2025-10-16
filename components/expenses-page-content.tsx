"use client"

import { Suspense, useEffect, useState } from "react"
import { EnhancedRecentExpenses } from "@/components/enhanced-recent-expenses"
import { ExpenseForm } from "@/components/expense-form"
import { EnhancedSpendingCharts } from "@/components/enhanced-spending-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, BarChart3, Plus } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ContextualAlerts, createInactivityAlert } from "@/components/contextual-alerts"

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
      if (minAmount !== null) query += `&minAmount=${minAmount}`
      if (maxAmount !== null) query += `&maxAmount=${maxAmount}`

      const [usersRes, expensesRes, statsRes] = await Promise.all([
        fetch('/api/users'),
        fetch(`/api/expenses?${query}`),
        fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`),
      ])

      const [usersData, expensesData, statsData] = await Promise.all([
        usersRes.json(),
        expensesRes.json(),
        statsRes.json(),
      ])

      setUsers(usersData)
      setExpenses(expensesData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch expenses data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedUser, selectedCategory, selectedType, minAmount, maxAmount])

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
    }
  }

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'user'>) => {
    // Generate temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`
    const user = users.find(u => u.id === expense.userId)

    if (!user) {
      alert('User not found')
      return
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
        setOptimisticExpenses(prev => prev.filter(e => e.id !== tempId))
      } else {
        throw new Error('API failed')
      }
    } catch (error) {
      // Rollback: remove optimistic expense and show error
      setOptimisticExpenses(prev => prev.filter(e => e.id !== tempId))
      console.error('Failed to add expense:', error)
      alert('Failed to add expense. Please try again.')
    }
  }

  const clearAllFilters = () => {
    setSelectedUser(null)
    setSelectedCategory(null)
    setSelectedType('all')
    setMinAmount(null)
    setMaxAmount(null)
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (selectedUser) count++
    if (selectedCategory) count++
    if (selectedType !== 'all') count++
    if (minAmount !== null) count++
    if (maxAmount !== null) count++
    return count
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 bg-amber-200 rounded-full mx-auto"></div>
          </div>
          <p className="text-muted-foreground">Loading expenses...</p>
        </div>
      </div>
    )
  }

  // Calculate days since last expense (excluding optimistic ones)
  const daysSinceLastExpense = (() => {
    if (expenses.length === 0) return null // Don't show if no historical data

    const realExpenses = expenses.filter(e => !e.id.startsWith('temp-'))
    if (realExpenses.length === 0) return null

    const sortedExpenses = [...realExpenses].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateB - dateA // Most recent first
    })

    const mostRecentExpense = sortedExpenses[0]
    const mostRecentDate = new Date(mostRecentExpense.date)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - mostRecentDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  })()

  // Generate contextual alerts
  const alerts = []
  if (daysSinceLastExpense !== null && daysSinceLastExpense > 3) {
    alerts.push(createInactivityAlert(daysSinceLastExpense))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getMonthName(selectedMonth)} Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your transactions and track spending patterns.
          </p>
        </div>
        <Button
          onClick={() => setAddingExpense(true)}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      {/* Contextual Alerts */}
      <ContextualAlerts alerts={alerts} />

      {/* Collapsible Analytics Section */}
      <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-700" />
                <CardTitle className="text-amber-900">Spending Analytics</CardTitle>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-amber-100">
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
              <EnhancedSpendingCharts
                spendingByCategory={stats.spendingByCategory}
                spendingPerPerson={stats.spendingPerPerson}
              />
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
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
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
        <ExpenseForm
          users={users}
          onSubmit={async (expense) => {
            await handleAddExpense(expense)
            setAddingExpense(false)
          }}
          open={addingExpense}
          onOpenChange={setAddingExpense}
        />
      )}

      {/* Edit Expense Form */}
      {editingExpense && (
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
      )}
    </div>
  )
}
