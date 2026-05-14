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
  month?: string // Format: "YYYY-MM" - shows all days of this month
  days?: number // Fallback: rolling N-day window from today
  className?: string
}

export default function SpendingSparkline({
  expenses,
  month,
  days = 30,
  className,
}: SpendingSparklineProps) {
  // Calculate date range based on month prop or fallback to rolling window
  const getDateRange = () => {
    if (month) {
      const [year, monthNum] = month.split("-").map(Number)
      const startDate = new Date(year, monthNum - 1, 1)
      const lastDay = new Date(year, monthNum, 0).getDate()
      return { startDate, numDays: lastDay }
    }
    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - days)
    return { startDate, numDays: days }
  }

  const { startDate, numDays } = getDateRange()

  // Daily spending map
  const dailySpending = new Map<string, number>()
  for (let i = 0; i < numDays; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    dailySpending.set(dateStr, 0)
  }

  expenses.forEach((exp) => {
    const expDate = exp.date.split("T")[0]
    if (dailySpending.has(expDate)) {
      dailySpending.set(expDate, (dailySpending.get(expDate) || 0) + exp.amount)
    }
  })

  const chartData = Array.from(dailySpending.entries())
    .map(([date, spending]) => ({ date, spending }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (chartData.length === 0) {
    return null
  }

  const avgSpending =
    chartData.reduce((sum, d) => sum + d.spending, 0) / chartData.length

  const chartConfig = {
    spending: {
      label: "Daily spending",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  return (
    <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
      <AreaChart
        data={chartData}
        margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        accessibilityLayer
      >
        <defs>
          <linearGradient id="fillSpending" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.45} />
            <stop offset="60%" stopColor="hsl(var(--chart-1))" stopOpacity={0.15} />
            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <ChartTooltip
          cursor={{ stroke: "hsl(var(--color-border))", strokeWidth: 1 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const data = payload[0].payload
            const [year, monthNum, day] = data.date.split("-").map(Number)
            const date = new Date(year, monthNum - 1, day)
            const formattedDate = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
            const percentVsAvg =
              avgSpending > 0
                ? (((data.spending - avgSpending) / avgSpending) * 100).toFixed(0)
                : "0"
            const isAboveAvg = data.spending > avgSpending

            return (
              <div className="rounded-md border border-stone-200 bg-card px-3 py-2 shadow-md dark:border-stone-800">
                <p className="text-xs font-medium text-stone-600 dark:text-stone-400">
                  {formattedDate}
                </p>
                <p className="font-display text-lg font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                  {formatCurrency(data.spending)}
                </p>
                {data.spending > 0 && (
                  <p
                    className={
                      "text-xs tabular-nums " +
                      (isAboveAvg
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400")
                    }
                  >
                    {isAboveAvg ? "+" : ""}
                    {percentVsAvg}% vs avg
                  </p>
                )}
              </div>
            )
          }}
        />
        <Area
          type="monotone"
          dataKey="spending"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          fill="url(#fillSpending)"
          fillOpacity={1}
          dot={false}
          activeDot={{
            r: 4,
            fill: "hsl(var(--color-background))",
            strokeWidth: 2,
            stroke: "hsl(var(--chart-1))",
          }}
          animationDuration={800}
        />
      </AreaChart>
    </ChartContainer>
  )
}
