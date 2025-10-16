"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Sparkles, TrendingUp, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface InsightsPageContentProps {
  month?: string
}

export function InsightsPageContent({ month }: InsightsPageContentProps) {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{getMonthName(selectedMonth)} Insights</h1>
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

    </div>
  )
}
