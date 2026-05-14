"use client"

import * as React from "react"
import { Repeat } from "lucide-react"
import { Pie, PieChart } from "recharts"

import { ChartCard } from "@/components/ui/chart-card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { categories, formatCurrency } from "@/lib/utils"

interface SpendingChartsProps {
  spendingByCategory: Array<{ category: string; amount: number }>
  spendingPerPerson: Array<{
    name: string
    total: number
    shared: number
    personal: number
    color: string
    recurringCount: number
  }>
}

export const EnhancedSpendingCharts = React.memo(function EnhancedSpendingCharts({
  spendingByCategory,
  spendingPerPerson,
}: SpendingChartsProps) {
  // Prepare category data for donut chart
  const categoryData = spendingByCategory.map((item, index) => {
    const category = categories.find((c) => c.value === item.category)
    return {
      category: category?.label || item.category,
      amount: item.amount,
      fill: category?.color || `hsl(var(--chart-${(index % 5) + 1}))`,
    }
  })

  // Chart configs
  const categoryChartConfig = {
    amount: {
      label: "Amount",
    },
    ...categoryData.reduce((acc, item) => {
      acc[item.category] = {
        label: item.category,
        color: item.fill,
      }
      return acc
    }, {} as Record<string, { label: string; color: string }>),
  } satisfies ChartConfig

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
      <ChartCard
        title="Spending by category"
        description="This month, by category."
      >
        <ChartContainer
          config={categoryChartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  className="border-stone-200 bg-card text-stone-900 shadow-md dark:border-stone-800 dark:text-stone-100"
                  formatter={(value, name) => (
                    <>
                      <span className="font-medium">{name}</span>
                      <span className="tabular-nums font-semibold">
                        {formatCurrency(Number(value))}
                      </span>
                    </>
                  )}
                />
              }
            />
            <Pie
              data={categoryData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {categoryData.map((item) => (
            <div
              key={item.category}
              className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300"
            >
              <div
                className="h-2.5 w-2.5 rounded-sm ring-1 ring-stone-200 dark:ring-stone-700"
                style={{ backgroundColor: item.fill }}
                aria-hidden="true"
              />
              <span className="font-medium truncate">{item.category}</span>
              <span className="ml-auto tabular-nums font-semibold text-stone-900 dark:text-stone-100">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard
        title="Spending per person"
        description="Personal vs shared, this month."
      >
        <div
          className={
            "grid gap-3 " +
            (spendingPerPerson.length >= 3 ? "md:grid-cols-2" : "")
          }
        >
          {spendingPerPerson.map((person) => (
            <div
              key={person.name}
              className="rounded-lg border border-stone-200 bg-card p-4 transition-shadow hover-elevation-hover dark:border-stone-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold text-white shadow-sm"
                  style={{ backgroundColor: person.color }}
                  aria-hidden="true"
                >
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate">
                    {person.name}
                  </h3>
                  <p className="font-display text-2xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                    {formatCurrency(person.total)}
                  </p>
                </div>
              </div>
              <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-stone-200 pt-3 dark:border-stone-800">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Personal
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                    {formatCurrency(person.personal)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    Shared
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                    {formatCurrency(person.shared)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    <Repeat className="h-3 w-3" aria-hidden="true" />
                    Recurring
                  </dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                    {person.recurringCount}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  )
})
