"use client"

import { useEffect, useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { EnhancedMetricsCards } from "@/components/enhanced-metrics-cards"
import { EnhancedSpendingCharts } from "@/components/enhanced-spending-charts"
import { EnhancedRecentExpenses } from "@/components/enhanced-recent-expenses"
import { ExpenseForm } from "@/components/expense-form"
import { ExportDialog } from "@/components/export-dialog"
import { UserManagement } from "@/components/user-management"
import { BudgetDialog } from "@/components/budget-dialog"
import { EnhancedBudgetProgress } from "@/components/enhanced-budget-progress"
import { MonthSelector } from "@/components/month-selector"
import { BreadyLogo } from "@/components/bready-logo"
import { SettlementCard } from "@/components/settlement-card"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

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

interface Settlement {
  from: {
    id: string
    name: string
    color: string
  }
  to: {
    id: string
    name: string
    color: string
  }
  amount: number
}

export default function Home() {
  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  }

  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth())
  const [stats, setStats] = useState<Stats>({
    totalSpent: 0,
    sharedExpenses: 0,
    spendingPerPerson: [],
    spendingByCategory: [],
  })
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [loading, setLoading] = useState(true)

  // Filter state for advanced expense filtering
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<'all' | 'shared' | 'personal'>('all')
  const [minAmount, setMinAmount] = useState<number | null>(null)
  const [maxAmount, setMaxAmount] = useState<number | null>(null)

  const fetchData = async () => {
    try {
      // First, generate any due recurring expenses
      await fetch('/api/recurring-expenses/generate', {
        method: 'POST',
      })

      // Calculate start and end dates for the selected month
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0] // First day
      const endDate = new Date(year, month, 0).toISOString().split('T')[0] // Last day

      // Build query params for expenses API with active filters
      let expensesQuery = `startDate=${startDate}&endDate=${endDate}`
      if (selectedUser) expensesQuery += `&userId=${selectedUser}`
      if (selectedCategory) expensesQuery += `&category=${selectedCategory}`
      if (selectedType !== 'all') {
        expensesQuery += `&isShared=${selectedType === 'shared'}`
      }
      if (minAmount !== null) expensesQuery += `&minAmount=${minAmount}`
      if (maxAmount !== null) expensesQuery += `&maxAmount=${maxAmount}`

      const [usersRes, expensesRes, statsRes, budgetsRes, settlementsRes] = await Promise.all([
        fetch('/api/users'),
        fetch(`/api/expenses?${expensesQuery}`),
        fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/budgets?month=${selectedMonth}`),
        fetch(`/api/settlements?startDate=${startDate}&endDate=${endDate}`),
      ])

      const [usersData, expensesData, statsData, budgetsData, settlementsData] = await Promise.all([
        usersRes.json(),
        expensesRes.json(),
        statsRes.json(),
        budgetsRes.json(),
        settlementsRes.json(),
      ])

      setUsers(usersData)
      setExpenses(expensesData)
      setStats(statsData)
      setBudgets(budgetsData)
      setSettlements(settlementsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth, selectedUser, selectedCategory, selectedType, minAmount, maxAmount])

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'user'>) => {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
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

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await fetchData()
    }
  }

  const handleMarkSettlementAsPaid = async (settlement: Settlement) => {
    const response = await fetch('/api/settlements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromUserId: settlement.from.id,
        toUserId: settlement.to.id,
        amount: settlement.amount,
        month: selectedMonth,
      }),
    })

    if (response.ok) {
      await fetchData()
    }
  }

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget?')) return

    const response = await fetch(`/api/budgets/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await fetchData()
    }
  }

  // Filter management helpers
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Mobile-responsive header */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8 md:flex-row md:items-center md:justify-between">
          {/* Logo and title section */}
          <div className="flex items-start gap-3">
            <BreadyLogo size={56} />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                Bready
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm">
                Track your dough
              </p>
            </div>
          </div>

          {/* Controls section - wraps on mobile */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10 sm:w-11 sm:h-11"
                }
              }}
            />
            <MonthSelector
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <BudgetDialog users={users} onBudgetSet={fetchData} />
              <ExpenseForm users={users} onSubmit={handleAddExpense} />
            </div>
          </div>
        </div>

        {/* Main content area with responsive spacing */}
        <div className="space-y-4 sm:space-y-6">
          <EnhancedMetricsCards
            totalSpent={stats.totalSpent}
            sharedExpenses={stats.sharedExpenses}
            userCount={users.length}
            settlements={settlements}
          />

          <EnhancedBudgetProgress
            budgets={budgets}
            spendingByCategory={stats.spendingByCategory}
            onDelete={handleDeleteBudget}
          />

          <EnhancedSpendingCharts
            spendingByCategory={stats.spendingByCategory}
            spendingPerPerson={stats.spendingPerPerson}
          />

          <SettlementCard
            settlements={settlements}
            onMarkAsPaid={handleMarkSettlementAsPaid}
          />

          <UserManagement users={users} onRefresh={fetchData} />

          <EnhancedRecentExpenses
            expenses={expenses}
            users={users}
            onEdit={(expense) => setEditingExpense(expense)}
            onDelete={handleDeleteExpense}
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
          />
        </div>

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
    </div>
  )
}
