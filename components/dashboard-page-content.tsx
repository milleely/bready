"use client"

import { Suspense, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Wallet,
  CircleDashed,
  Plus
} from "lucide-react"
import { formatCurrency, categories } from "@/lib/utils"
import Link from "next/link"
import { SpendingSparkline } from "@/components/spending-sparkline"
import { BreadyLogo } from "@/components/bready-logo"
import { ExpenseForm } from "@/components/expense-form"

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

interface Budget {
  id: string
  category: string
  amount: number
  userId: string | null
}

interface Expense {
  id: string
  amount: number
  category: string
  userId: string
  isShared: boolean
  date: string
}

interface Settlement {
  from: { id: string; name: string; color: string }
  to: { id: string; name: string; color: string }
  amount: number
}

interface RecurringExpense {
  id: string
  amount: number
  category: string
  description: string
  frequency: string
  nextDate: string
}

interface User {
  id: string
  name: string
  color: string
}

interface DashboardPageContentProps {
  month?: string
}

export function DashboardPageContent({ month }: DashboardPageContentProps) {
  const [stats, setStats] = useState<Stats>({
    totalSpent: 0,
    sharedExpenses: 0,
    spendingPerPerson: [],
    spendingByCategory: [],
  })
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [previousMonthTotal, setPreviousMonthTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])

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

  const getPreviousMonth = () => {
    const today = new Date()
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
  }

  const fetchData = async () => {
    try {
      const prevMonth = getPreviousMonth()

      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const [prevYear, prevMonthNum] = prevMonth.split('-').map(Number)
      const prevStartDate = new Date(prevYear, prevMonthNum - 1, 1).toISOString().split('T')[0]
      const prevEndDate = new Date(prevYear, prevMonthNum, 0).toISOString().split('T')[0]

      const [statsRes, budgetsRes, expensesRes, settlementsRes, prevStatsRes, recurringRes] = await Promise.all([
        fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/budgets?month=${selectedMonth}`),
        fetch(`/api/expenses?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/settlements?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/stats?startDate=${prevStartDate}&endDate=${prevEndDate}`),
        fetch(`/api/recurring-expenses`),
      ])

      const [statsData, budgetsData, expensesData, settlementsData, prevStatsData, recurringData] = await Promise.all([
        statsRes.json(),
        budgetsRes.json(),
        expensesRes.json(),
        settlementsRes.json(),
        prevStatsRes.json(),
        recurringRes.json(),
      ])

      setStats(statsData)
      setBudgets(Array.isArray(budgetsData) ? budgetsData : [])
      setExpenses(Array.isArray(expensesData) ? expensesData : [])
      setSettlements(Array.isArray(settlementsData) ? settlementsData : [])
      setRecurringExpenses(Array.isArray(recurringData) ? recurringData : [])
      setPreviousMonthTotal(prevStatsData.totalSpent || 0)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  // Listen for expense added event from sidebar
  useEffect(() => {
    const handleExpenseAdded = () => {
      fetchData()
    }

    window.addEventListener('expenseAdded', handleExpenseAdded)
    return () => window.removeEventListener('expenseAdded', handleExpenseAdded)
  }, [selectedMonth])

  // Fetch users for expense form
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const usersData = await response.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])

  // Calculate budget health
  const getBudgetHealth = () => {
    if (budgets.length === 0) return { onTrack: 0, warning: 0, over: 0 }

    let onTrack = 0
    let warning = 0
    let over = 0

    budgets.forEach(budget => {
      const spent = budget.userId
        ? expenses.filter(e => e.userId === budget.userId && e.category === budget.category)
            .reduce((sum, e) => sum + e.amount, 0)
        : stats.spendingByCategory.find(s => s.category === budget.category)?.amount || 0

      const percentage = (spent / budget.amount) * 100

      if (percentage > 100) over++
      else if (percentage > 80) warning++
      else onTrack++
    })

    return { onTrack, warning, over }
  }

  const budgetHealth = getBudgetHealth()
  const totalBudgets = budgets.length

  // Calculate overall budget health indicator
  const getOverallBudgetHealth = () => {
    if (budgets.length === 0) return { status: 'none' as const, emoji: '⚪', label: 'No Budgets Set', color: 'text-gray-400' }

    if (budgetHealth.over > 0) {
      return { status: 'over' as const, emoji: '🔴', label: 'Over Budget', color: 'text-red-100' }
    } else if (budgetHealth.warning > 0) {
      return { status: 'warning' as const, emoji: '🟡', label: 'Watch Spending', color: 'text-amber-100' }
    } else {
      return { status: 'healthy' as const, emoji: '🟢', label: 'Healthy', color: 'text-green-100' }
    }
  }

  const overallHealth = getOverallBudgetHealth()

  // Calculate trend
  const spendingChange = stats.totalSpent - previousMonthTotal
  const spendingChangePercent = previousMonthTotal > 0
    ? ((spendingChange / previousMonthTotal) * 100).toFixed(1)
    : 0

  const isSpendingUp = spendingChange > 0

  // Calculate personal expenses
  const personalExpenses = stats.totalSpent - stats.sharedExpenses

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wallet className="h-12 w-12 animate-pulse mx-auto mb-4 text-amber-600" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (stats.totalSpent === 0 && expenses.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to Bready!</p>
        </div>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6 flex justify-center">
              <BreadyLogo size={64} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Start Tracking Your Dough</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't added any expenses for this month yet. Start by adding your first expense to see your financial insights.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                size="lg"
                onClick={() => setExpenseFormOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Your First Expense
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Expense Form Dialog */}
        {expenseFormOpen && (
          <ExpenseForm
            users={users}
            onSubmit={async () => {
              setExpenseFormOpen(false)
              await fetchData()
            }}
            open={expenseFormOpen}
            onOpenChange={setExpenseFormOpen}
          />
        )}
      </div>
    )
  }

  const topCategories = stats.spendingByCategory
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your financial snapshot for {getMonthName(selectedMonth)}</p>
      </div>

      {/* Hero Card - This Month at a Glance */}
      <Card className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 border-0 shadow-xl text-white">
        <CardContent className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-8">
            {/* Left Column: Financial Numbers (60%) */}
            <div className="flex-1 md:max-w-[60%]">
              <p className="text-amber-100 text-sm font-medium mb-2">{getMonthName(selectedMonth)} at a Glance</p>
              <h2 className="text-5xl font-bold mb-3">{formatCurrency(stats.totalSpent)}</h2>

              {/* Trend Indicator */}
              <div className="flex items-center gap-2 mb-4">
                {isSpendingUp ? (
                  <TrendingUp className="h-5 w-5" />
                ) : (
                  <TrendingDown className="h-5 w-5" />
                )}
                <span className="text-lg font-semibold">
                  {isSpendingUp ? '+' : ''}{formatCurrency(Math.abs(spendingChange))}
                </span>
                <span className="text-sm text-amber-100/90 whitespace-nowrap">
                  ({isSpendingUp ? '+' : ''}{spendingChangePercent}% vs last mo)
                </span>
              </div>

              {/* Nested Breakdown */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-100">Including:</p>
                <div className="ml-3 space-y-1">
                  <div className="text-base opacity-90 flex items-center gap-2">
                    <span className="text-xs">🥖</span>
                    <span>Shared: {formatCurrency(stats.sharedExpenses)}</span>
                  </div>
                  <div className="text-base opacity-90 flex items-center gap-2">
                    <span className="text-xs">🍞</span>
                    <span>Personal: {formatCurrency(personalExpenses)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Visuals (40%) */}
            <div className="flex flex-col items-end gap-4 w-full">
              {/* Budget Health Indicator */}
              <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3 backdrop-blur-sm">
                {overallHealth.status === 'healthy' && (
                  <div className="bg-green-500/90 rounded-full p-1.5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                )}
                {overallHealth.status === 'warning' && (
                  <div className="bg-amber-400/90 rounded-full p-1.5 shadow-sm">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                )}
                {overallHealth.status === 'over' && (
                  <div className="bg-red-500/90 rounded-full p-1.5 shadow-sm">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                )}
                {overallHealth.status === 'none' && (
                  <div className="bg-gray-400/80 rounded-full p-1.5 shadow-sm">
                    <CircleDashed className="h-5 w-5 text-white" />
                  </div>
                )}
                <div className="text-right">
                  <div className={`text-xs font-medium ${overallHealth.color}`}>Budget Health</div>
                  <div className="text-sm font-bold">{overallHealth.label}</div>
                </div>
              </div>

              {/* 30-Day Sparkline - Enhanced & Enlarged */}
              <div className="w-full md:w-72 h-44 bg-white/10 rounded-lg overflow-hidden border border-white/20 shadow-[0_0_16px_rgba(255,255,255,0.2),0_2px_8px_rgba(0,0,0,0.1)]">
                <SpendingSparkline expenses={expenses} days={30} />
              </div>
              <p className="text-xs text-amber-100 font-medium">30-day trend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Budget Health Summary */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="h-5 w-5 text-amber-700" />
              Budget Health
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col min-h-[200px]">
            {totalBudgets === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-600 mb-3">No budgets set yet</p>
                <Link href="/budgets">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white hover:shadow-lg transition-all"
                  >
                    Set Your First Budget
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">On Track</span>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {budgetHealth.onTrack}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-gray-700">Warning</span>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      {budgetHealth.warning}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-gray-700">Over Budget</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {budgetHealth.over}
                    </Badge>
                  </div>
                </div>
                <Link href="/budgets" className="mt-auto">
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white hover:shadow-lg transition-all"
                  >
                    View All Budgets <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Settlements */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Wallet className="h-5 w-5 text-amber-700" />
              Settlements
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col min-h-[200px]">
            {settlements.length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">All Settled Up!</p>
                <p className="text-xs text-gray-600 mt-1">No pending settlements this month</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(settlements.reduce((sum, s) => sum + s.amount, 0))}
                    </span>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      {settlements.length} pending
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {settlements.length} {settlements.length === 1 ? 'settlement' : 'settlements'} need attention
                  </p>
                </div>
                <Link href="/settlements" className="mt-auto">
                  <Button
                    size="sm"
                    className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white hover:shadow-lg transition-all"
                  >
                    Settle Now <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 3 Categories */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-amber-900">Top Spending Categories</CardTitle>
            <Link href="/insights">
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white hover:shadow-lg transition-all"
              >
                View All <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No expenses yet. Start tracking to see your top categories!
            </p>
          ) : (
            <div className="space-y-4">
              {topCategories.map(cat => {
                const categoryInfo = categories.find(c => c.value === cat.category)
                const percentage = ((cat.amount / stats.totalSpent) * 100).toFixed(1)

                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{categoryInfo?.icon || '📦'}</span>
                        <span className="font-medium text-gray-900">
                          {categoryInfo?.label || cat.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(cat.amount)}</div>
                        <div className="text-xs text-gray-600">{percentage}% of total</div>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryInfo?.color || '#78716c'
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Form Dialog */}
      {expenseFormOpen && (
        <ExpenseForm
          users={users}
          onSubmit={async () => {
            setExpenseFormOpen(false)
            await fetchData()
          }}
          open={expenseFormOpen}
          onOpenChange={setExpenseFormOpen}
        />
      )}
    </div>
  )
}
