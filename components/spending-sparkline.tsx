"use client"

import { Area, AreaChart } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { formatCurrency } from "@/lib/utils"

interface SpendingSparklineProps {
  expenses: Array<{ date: string; amount: number }>
  month?: string  // Format: "YYYY-MM" - shows all days of this month
  days?: number   // Fallback: rolling N-day window from today
  className?: string
}

export default function SpendingSparkline({ expenses, month, days = 30, className }: SpendingSparklineProps) {
  // Calculate date range based on month prop or fallback to rolling window
  const getDateRange = () => {
    if (month) {
      // Use selected month - show all days from 1st to last day
      const [year, monthNum] = month.split('-').map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const lastDay = new Date(year, monthNum, 0).getDate() // Last day of month
      return { startDate, numDays: lastDay }
    }
    // Fallback to rolling N-day window from today
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - days)
    return { startDate, numDays: days }
  }

  const { startDate, numDays } = getDateRange()

  // Create daily spending map
  const dailySpending = new Map<string, number>()

  // Initialize all days with 0
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    // Format as YYYY-MM-DD in local timezone (avoid UTC shift from toISOString)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    dailySpending.set(dateStr, 0)
  }

  // Aggregate expenses by date
  expenses.forEach(exp => {
    const expDate = exp.date.split('T')[0] // Get YYYY-MM-DD
    if (dailySpending.has(expDate)) {
      dailySpending.set(expDate, (dailySpending.get(expDate) || 0) + exp.amount)
    }
  })

  // Convert to chart data
  const chartData = Array.from(dailySpending.entries())
    .map(([date, spending]) => ({ date, spending }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (chartData.length === 0) {
    return null
  }

  // Calculate average spending for tooltip context
  const avgSpending = chartData.reduce((sum, d) => sum + d.spending, 0) / chartData.length

  const chartConfig = {
    spending: {
      label: "Daily Spending",
      color: "rgba(255, 255, 255, 0.9)",
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <AreaChart
        data={chartData}
        margin={{ top: 0, right: -4, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="fillSpending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.6)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.25)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
        </defs>
        <ChartTooltip
          cursor={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const data = payload[0].payload
            // Parse date string as local time (avoid UTC interpretation)
            const [year, month, day] = data.date.split('-').map(Number)
            const date = new Date(year, month - 1, day)
            const formattedDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })

            const percentVsAvg = ((data.spending - avgSpending) / avgSpending * 100).toFixed(0)
            const isAboveAvg = data.spending > avgSpending

            return (
              <div className="bg-white/95 backdrop-blur-sm border border-amber-200 rounded-lg px-3 py-2 shadow-xl">
                <p className="text-xs font-medium text-amber-900">{formattedDate}</p>
                <p className="text-lg font-bold text-amber-700">
                  {formatCurrency(data.spending)}
                </p>
                {data.spending > 0 && (
                  <p className={`text-xs ${isAboveAvg ? 'text-orange-600' : 'text-green-600'}`}>
                    {isAboveAvg ? '+' : ''}{percentVsAvg}% vs avg
                  </p>
                )}
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="spending"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth={2}
          fill="url(#fillSpending)"
          fillOpacity={1}
          dot={false}
          activeDot={{ r: 4, fill: 'white', strokeWidth: 2, stroke: 'rgba(251, 146, 60, 0.8)' }}
          animationDuration={500}
        />
      </AreaChart>
    </ChartContainer>
  )
}
