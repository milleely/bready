"use client"

import { useEffect, useState } from "react"
import { EnhancedMetricsCards } from "@/components/enhanced-metrics-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalSpent: 0,
    sharedExpenses: 0,
    spendingPerPerson: [],
    spendingByCategory: [],
  })
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)

  // Get current month for filtering
  const getCurrentMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  }

  const fetchData = async () => {
    try {
      const selectedMonth = getCurrentMonth()
      const [year, month] = selectedMonth.split('-').map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
      const endDate = new Date(year, month, 0).toISOString().split('T')[0]

      const [statsRes, settlementsRes] = await Promise.all([
        fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/settlements?startDate=${startDate}&endDate=${endDate}`),
      ])

      const [statsData, settlementsData] = await Promise.all([
        statsRes.json(),
        settlementsRes.json(),
      ])

      setStats(statsData)
      setSettlements(settlementsData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="h-12 w-12 bg-amber-200 rounded-full mx-auto"></div>
          </div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your financial snapshot.</p>
      </div>

      {/* Key Metrics */}
      <EnhancedMetricsCards
        totalSpent={stats.totalSpent}
        sharedExpenses={stats.sharedExpenses}
        userCount={stats.spendingPerPerson.length}
        settlements={settlements}
      />

      {/* Quick Insights Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Spending Trend Card */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <TrendingUp className="h-5 w-5" />
              This Month's Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Spending</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                <p>Track your spending across all categories and users.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Budget Alert Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <AlertTriangle className="h-5 w-5" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                View detailed budget tracking and set new budgets in the Budgets page.
              </p>
              <div className="flex gap-2">
                <a
                  href="/budgets"
                  className="text-sm font-medium text-amber-700 hover:text-amber-800 underline"
                >
                  Go to Budgets →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown Preview */}
      <Card className="bg-white border-0 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Top Spending Categories</CardTitle>
            <a
              href="/insights"
              className="text-sm font-medium text-amber-700 hover:text-amber-800 underline"
            >
              View All Insights →
            </a>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.spendingByCategory
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 5)
              .map((cat) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize text-gray-700">
                    {cat.category.replace('-', ' ')}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(cat.amount)}
                  </span>
                </div>
              ))}
            {stats.spendingByCategory.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No expenses yet this month. Start tracking!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
