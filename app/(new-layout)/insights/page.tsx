"use client"

import { useEffect, useState } from "react"
import { EnhancedSpendingCharts } from "@/components/enhanced-spending-charts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Sparkles, TrendingUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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

export default function InsightsPage() {
  const [stats, setStats] = useState<Stats>({
    totalSpent: 0,
    sharedExpenses: 0,
    spendingPerPerson: [],
    spendingByCategory: [],
  })
  const [loading, setLoading] = useState(true)

  // Get current month
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

      const statsRes = await fetch(`/api/stats?startDate=${startDate}&endDate=${endDate}`)
      const statsData = await statsRes.json()

      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch insights data:', error)
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
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Insights</h1>
        <p className="text-muted-foreground mt-1">
          AI-powered analytics and spending patterns to help you make better financial decisions.
        </p>
      </div>

      {/* AI Insights Placeholder Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Brain className="h-6 w-6" />
              AI Financial Insights
            </CardTitle>
            <Badge variant="secondary" className="bg-purple-200 text-purple-900">
              <Sparkles className="h-3 w-3 mr-1" />
              Coming Soon
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Get personalized financial coaching powered by AI. Soon you'll receive:
          </p>

          <div className="space-y-3">
            {/* Insight Examples */}
            <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-amber-700" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Budget Alerts</h4>
                  <p className="text-sm text-gray-600">
                    "You've spent $450 on dining (150% of budget). Try limiting to 2x/week to save $150."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-700" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Spending Trends</h4>
                  <p className="text-sm text-gray-600">
                    "Your grocery spending is 15% lower than last month. Great job!"
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/70 rounded-lg p-4 border border-purple-100">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Smart Recommendations</h4>
                  <p className="text-sm text-gray-600">
                    "Consider setting a $50/week dining budget to stay on track."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 bg-white/50 rounded-lg p-3 border border-purple-100">
            <p className="font-medium text-purple-900 mb-1">What's next?</p>
            <p>
              We're building AI-powered insights that will analyze your spending patterns, detect anomalies,
              predict future expenses, and provide personalized financial coaching.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Existing Charts */}
      <EnhancedSpendingCharts
        spendingByCategory={stats.spendingByCategory}
        spendingPerPerson={stats.spendingPerPerson}
      />

      {/* Additional Insights Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Top Spending Category</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.spendingByCategory.length > 0 ? (
              <div>
                <p className="text-2xl font-bold text-gray-900 capitalize">
                  {stats.spendingByCategory[0]?.category.replace('-', ' ')}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  ${stats.spendingByCategory[0]?.amount.toFixed(2)} spent this month
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No expenses yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Shared vs Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shared Expenses</span>
                <span className="text-sm font-bold text-gray-900">
                  ${stats.sharedExpenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Personal Expenses</span>
                <span className="text-sm font-bold text-gray-900">
                  ${(stats.totalSpent - stats.sharedExpenses).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
