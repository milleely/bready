"use client"

import { Suspense, useEffect, useState, useMemo, lazy, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { ChartCard } from "@/components/ui/chart-card"
import { TrendBadge } from "@/components/ui/trend-badge"
import { AnimatedNumber } from "@/components/ui/animated-number"
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Wallet,
  CircleDashed,
  Plus,
  XCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { formatCurrency, categories, cn } from "@/lib/utils"
import Link from "next/link"
// 🚀 PERFORMANCE: Lazy load chart component to reduce initial bundle size
const SpendingSparkline = lazy(() => import("@/components/spending-sparkline"))
import { ExpenseForm } from "@/components/expense-form"
import { Skeleton } from "@/components/ui/skeleton"

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
    subscriptionCount: number
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

  // Calculate previous month relative to selected month (not today)
  const getPreviousMonthOf = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    const prevMonth = new Date(year, month - 2, 1) // month-1 for 0-indexed, then -1 for previous
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`
  }

  const fetchData = async () => {
    try {
      const prevMonth = getPreviousMonthOf(selectedMonth)

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

  // Persist a new expense, then close the dialog and refresh the dashboard.
  // ExpenseForm builds the payload and delegates the actual POST to this handler.
  // Throwing on failure lets ExpenseForm surface the API error to the user.
  const handleAddExpense = async (expense: {
    amount: number
    category: string
    description: string
    date: Date | string
    isShared: boolean
    userId: string
  }) => {
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `Server error (${res.status})`)
    }
    setExpenseFormOpen(false)
    await fetchData()
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  // 🚀 PERFORMANCE: Debounced event handler to prevent multiple rapid fetches
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const debouncedFetchData = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      fetchData()
    }, 150) // 150ms debounce - fast enough to feel instant, prevents duplicate calls
  }, [selectedMonth])

  // Listen for expense changes from other pages
  useEffect(() => {
    const handleExpenseChange = () => {
      debouncedFetchData()
    }

    window.addEventListener('expenseAdded', handleExpenseChange)
    window.addEventListener('expenseEdited', handleExpenseChange)
    window.addEventListener('expenseDeleted', handleExpenseChange)

    return () => {
      window.removeEventListener('expenseAdded', handleExpenseChange)
      window.removeEventListener('expenseEdited', handleExpenseChange)
      window.removeEventListener('expenseDeleted', handleExpenseChange)
      // Clear timeout on cleanup
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [debouncedFetchData])

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

  // 🚀 PERFORMANCE: Memoized budget health calculation to prevent redundant loops
  const budgetHealth = useMemo(() => {
    if (!stats.spendingByCategory) return { onTrack: 0, warning: 0, over: 0 }
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
  }, [budgets, expenses, stats.spendingByCategory])

  // 🚀 PERFORMANCE: Memoized top categories to prevent redundant sorting
  const topCategories = useMemo(() =>
    (stats.spendingByCategory || [])
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3),
    [stats.spendingByCategory]
  )

  const totalBudgets = budgets.length

  // Calculate overall budget health indicator — lucide icon + tone, no emoji
  type HealthStatus = "none" | "healthy" | "warning" | "over"
  const getOverallBudgetHealth = (): {
    status: HealthStatus
    label: string
    Icon: LucideIcon
  } => {
    if (budgets.length === 0)
      return { status: "none", label: "No budgets set", Icon: CircleDashed }
    if (budgetHealth.over > 0)
      return { status: "over", label: "Over budget", Icon: AlertTriangle }
    if (budgetHealth.warning > 0)
      return { status: "warning", label: "Watching", Icon: AlertCircle }
    return { status: "healthy", label: "On track", Icon: CheckCircle2 }
  }

  const overallHealth = getOverallBudgetHealth()

  // Calculate trend
  const spendingChange = stats.totalSpent - previousMonthTotal
  const spendingChangePercent = previousMonthTotal > 0
    ? ((spendingChange / previousMonthTotal) * 100).toFixed(1)
    : 0

  const isSpendingUp = spendingChange > 0
  const hasPreviousMonthData = previousMonthTotal > 0

  // Calculate personal expenses
  const personalExpenses = stats.totalSpent - stats.sharedExpenses

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-busy="true">
        <span className="sr-only">Loading dashboard</span>

        {/* PageHeader skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>

        {/* Hero — caption + headline numeral + trend pill + breakdown line */}
        <section className="relative overflow-hidden rounded-3xl surface-card-hero elevation-prominent text-white px-6 py-8 md:px-10 md:py-12">
          <Skeleton className="h-3 w-32 bg-white/15" />
          <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
            <Skeleton className="h-14 md:h-20 w-56 md:w-80 bg-white/15" />
            <Skeleton className="h-7 w-48 rounded-md bg-white/15" />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1">
            <Skeleton className="h-4 w-32 bg-white/15" />
            <Skeleton className="h-4 w-32 bg-white/15" />
          </div>
        </section>

        {/* Row 2 — Daily spending ChartCard + Budget health card */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Daily spending */}
          <div className="flex flex-col rounded-xl border border-stone-200 bg-card shadow-sm dark:border-stone-800">
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 px-5 py-4 dark:border-stone-800">
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="p-5">
              <Skeleton className="h-44 w-full rounded-md" />
            </div>
            <div className="border-t border-stone-200 px-5 py-3 dark:border-stone-800">
              <Skeleton className="h-3 w-32" />
            </div>
          </div>

          {/* Budget health */}
          <div className="rounded-xl border border-stone-200 bg-card shadow-sm dark:border-stone-800">
            <div className="flex flex-row items-center justify-between gap-2 p-6 pb-4">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-24 rounded-md" />
            </div>
            <div className="px-6 pb-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-sm" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
              <Skeleton className="h-4 w-32 mt-2" />
            </div>
          </div>
        </div>

        {/* Top categories — title + action link, then 3 rows with icon chip + label + amount + progress bar */}
        <div className="rounded-xl border border-stone-200 bg-card shadow-sm dark:border-stone-800">
          <div className="flex flex-row items-center justify-between p-6 pb-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="px-6 pb-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="space-y-1 text-right">
                    <Skeleton className="h-4 w-20 ml-auto" />
                    <Skeleton className="h-3 w-16 ml-auto" />
                  </div>
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Empty state
  if (stats.totalSpent === 0 && expenses.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description={`Your snapshot for ${getMonthName(selectedMonth)}.`}
        />

        <EmptyState
          icon={Sparkles}
          title="Welcome to Bready"
          description="Add your first expense to see your month take shape."
          action={
            <Button
              size="lg"
              onClick={() => setExpenseFormOpen(true)}
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add your first expense
            </Button>
          }
          className="rounded-xl border border-stone-200 bg-card dark:border-stone-800"
        />

        {/* Expense Form Dialog */}
        {expenseFormOpen && (
          <ExpenseForm
            users={users}
            onSubmit={handleAddExpense}
            open={expenseFormOpen}
            onOpenChange={setExpenseFormOpen}
          />
        )}
      </div>
    )
  }

  // Approximate avg/day for the sparkline footer
  const daysInMonth = (() => {
    const [year, monthNum] = selectedMonth.split("-").map(Number)
    return new Date(year, monthNum, 0).getDate()
  })()
  const avgPerDay = stats.totalSpent > 0 ? stats.totalSpent / daysInMonth : 0

  const HealthIcon = overallHealth.Icon

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Your snapshot for ${getMonthName(selectedMonth)}.`}
      />

      {/* Hero — headline numeral + trend + secondary breakdown */}
      <section
        className="relative overflow-hidden rounded-3xl surface-card-hero elevation-prominent text-white px-6 py-8 md:px-10 md:py-12"
        aria-label="Spending overview"
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-50/80">
          {getMonthName(selectedMonth)}
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
          <AnimatedNumber
            value={stats.totalSpent}
            format={formatCurrency}
            duration={0.7}
            className="font-display text-5xl md:text-7xl font-semibold tabular-nums leading-none"
          />
          {hasPreviousMonthData ? (
            <TrendBadge
              direction={spendingChange === 0 ? "flat" : isSpendingUp ? "up" : "down"}
              delta={`${isSpendingUp ? "+" : ""}${formatCurrency(Math.abs(spendingChange))}`}
              period={`${spendingChangePercent}% vs last month`}
              invertSemantics
              className="!bg-white/10 !text-amber-50 ring-1 ring-inset ring-white/20 backdrop-blur-sm"
            />
          ) : (
            <span className="text-sm text-amber-50/70">No data from last month</span>
          )}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-amber-50/85">
          <span>
            <span className="font-semibold text-amber-50">Shared</span>{" "}
            <span className="tabular-nums">{formatCurrency(stats.sharedExpenses)}</span>
          </span>
          <span className="hidden sm:inline text-amber-50/40">·</span>
          <span>
            <span className="font-semibold text-amber-50">Personal</span>{" "}
            <span className="tabular-nums">{formatCurrency(personalExpenses)}</span>
          </span>
        </div>
      </section>

      {/* Row 2 — Daily spending + Budget health */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard
          title="Daily spending"
          description="This month"
          footer={`Avg ${formatCurrency(avgPerDay)} per day`}
        >
          <div className="h-44 w-full">
            <Suspense fallback={<Skeleton className="h-44 w-full rounded-lg" />}>
              <SpendingSparkline expenses={expenses} month={selectedMonth} />
            </Suspense>
          </div>
        </ChartCard>

        <Card className="rounded-xl border border-stone-200 bg-card dark:border-stone-800">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              Budget health
            </CardTitle>
            {totalBudgets > 0 && (
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 border-stone-200 text-stone-700 dark:border-stone-700 dark:text-stone-300"
              >
                <HealthIcon
                  className={cn("h-3.5 w-3.5", {
                    "text-emerald-600 dark:text-emerald-400": overallHealth.status === "healthy",
                    "text-amber-600 dark:text-amber-400": overallHealth.status === "warning",
                    "text-rose-600 dark:text-rose-400": overallHealth.status === "over",
                    "text-stone-500 dark:text-stone-400": overallHealth.status === "none",
                  })}
                />
                {overallHealth.label}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {totalBudgets === 0 ? (
              <div className="flex flex-col items-start gap-3 py-2">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  No budgets yet — set one to see how spending is breathing.
                </p>
                <Link href="/budgets">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                    Set your first budget
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <ul className="space-y-2.5">
                  <BudgetHealthRow
                    Icon={CheckCircle2}
                    label="On track"
                    count={budgetHealth.onTrack}
                    total={totalBudgets}
                    tone="success"
                  />
                  <BudgetHealthRow
                    Icon={AlertCircle}
                    label="Watching"
                    count={budgetHealth.warning}
                    total={totalBudgets}
                    tone="warning"
                  />
                  <BudgetHealthRow
                    Icon={XCircle}
                    label="Over budget"
                    count={budgetHealth.over}
                    total={totalBudgets}
                    tone="danger"
                  />
                </ul>
                <Link
                  href="/budgets"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
                >
                  View all budgets
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Settlements — kept as a focused secondary card */}
      {settlements.length > 0 && (
        <Card className="rounded-xl border border-stone-200 bg-card dark:border-stone-800">
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
              <Wallet className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Settlements
            </CardTitle>
            <Badge
              variant="outline"
              className="border-amber-200 text-amber-800 dark:border-amber-900 dark:text-amber-300"
            >
              {settlements.length} pending
            </Badge>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-display text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                {formatCurrency(settlements.reduce((sum, s) => sum + s.amount, 0))}
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {settlements.length === 1 ? "settlement" : "settlements"} need attention
              </p>
            </div>
            <Link href="/settlements">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                Settle now
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Categories — neutralized styling */}
      <Card className="rounded-xl border border-stone-200 bg-card dark:border-stone-800">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
            Top spending categories
          </CardTitle>
          <Link
            href="/expenses"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent>
          {topCategories.length === 0 ? (
            <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-6">
              No expenses yet — start tracking to see your top categories.
            </p>
          ) : (
            <div className="space-y-4">
              {topCategories.map((cat) => {
                const categoryInfo = categories.find((c) => c.value === cat.category)
                const percentage = ((cat.amount / stats.totalSpent) * 100).toFixed(1)

                return (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center rounded-full text-sm"
                          aria-hidden="true"
                          style={{
                            backgroundColor: `${categoryInfo?.color || "#78716c"}1a`,
                          }}
                        >
                          {categoryInfo?.icon || "📦"}
                        </span>
                        <span className="font-medium text-stone-800 dark:text-stone-200 truncate">
                          {categoryInfo?.label || cat.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                          {formatCurrency(cat.amount)}
                        </div>
                        <div className="text-xs tabular-nums text-stone-500 dark:text-stone-400">
                          {percentage}% of total
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: categoryInfo?.color || "#78716c",
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
          onSubmit={handleAddExpense}
          open={expenseFormOpen}
          onOpenChange={setExpenseFormOpen}
        />
      )}
    </div>
  )
}

// Small helper for budget-health rows — keeps the dashboard JSX readable
function BudgetHealthRow({
  Icon,
  label,
  count,
  total,
  tone,
}: {
  Icon: LucideIcon
  label: string
  count: number
  total: number
  tone: "success" | "warning" | "danger"
}) {
  const iconColor = {
    success: "text-emerald-600 dark:text-emerald-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-rose-600 dark:text-rose-400",
  }[tone]
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
        <Icon className={cn("h-4 w-4", iconColor)} aria-hidden="true" />
        {label}
      </span>
      <span className="tabular-nums text-stone-600 dark:text-stone-400">
        <span className="font-semibold text-stone-900 dark:text-stone-100">{count}</span>
        <span className="text-stone-500 dark:text-stone-500"> of {total}</span>
      </span>
    </li>
  )
}
