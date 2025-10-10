"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Label } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { categories, formatCurrency } from "@/lib/utils"

interface SpendingChartsProps {
  spendingByCategory: Array<{ category: string; amount: number }>
  spendingPerPerson: Array<{ name: string; total: number; shared: number; personal: number; color: string }>
}

export function EnhancedSpendingCharts({ spendingByCategory, spendingPerPerson }: SpendingChartsProps) {
  // Prepare category data for donut chart
  const categoryData = spendingByCategory.map((item, index) => {
    const category = categories.find(c => c.value === item.category)
    return {
      category: category?.label || item.category,
      amount: item.amount,
      fill: category?.color || `hsl(var(--chart-${(index % 5) + 1}))`
    }
  })

  const totalCategorySpending = React.useMemo(() => {
    return categoryData.reduce((acc, curr) => acc + curr.amount, 0)
  }, [categoryData])

  // Prepare person data for stacked bar chart
  const personData = spendingPerPerson.map(person => ({
    name: person.name,
    personal: person.personal,
    shared: person.shared,
  }))

  // Chart configs
  const categoryChartConfig = {
    amount: {
      label: "Amount",
    },
    ...categoryData.reduce((acc, item, index) => {
      acc[item.category] = {
        label: item.category,
        color: item.fill,
      }
      return acc
    }, {} as Record<string, { label: string; color: string }>)
  } satisfies ChartConfig

  const personChartConfig = {
    personal: {
      label: "Personal",
      color: "#e3c462",
    },
    shared: {
      label: "Shared",
      color: "#e7d791",
    },
  } satisfies ChartConfig

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Donut Chart for Category Spending */}
      <Card className="flex flex-col bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-md">
        <CardHeader className="items-center pb-0">
          <CardTitle className="text-golden-crust-dark">Spending by Category</CardTitle>
          <CardDescription className="text-golden-crust-dark/70">Breakdown of expenses by category</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={categoryChartConfig}
            className="mx-auto aspect-square max-h-[350px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="bg-amber-50 border-2 border-golden-crust-primary text-golden-crust-dark font-semibold shadow-lg"
                    formatter={(value) => formatCurrency(Number(value))}
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
        </CardContent>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2">
            {categoryData.map((item) => (
              <div key={item.category} className="flex items-center gap-2 text-sm">
                <div
                  className="h-3 w-3 rounded-sm ring-1 ring-golden-crust-dark/20"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="font-medium text-golden-crust-dark text-xs">
                  {item.category}: {formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Horizontal Bar Chart for Per-Person Spending */}
      <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-golden-crust-dark">Spending per Person</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {spendingPerPerson.map((person) => {
            const maxSpending = Math.max(...spendingPerPerson.map(p => p.total))
            const percentage = (person.total / maxSpending) * 100
            const personalPercentage = (person.personal / person.total) * 100

            return (
              <div key={person.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-golden-crust-dark">{person.name}</span>
                  <span className="text-base font-bold text-golden-crust-dark">{formatCurrency(person.total)}</span>
                </div>
                <div className="relative w-full h-8 bg-gray-200/50 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      background: 'linear-gradient(to right, #e3c462, #fdf885)'
                    }}
                  >
                    <div
                      className="absolute top-0 right-0 h-full rounded-r-full"
                      style={{
                        width: `${100 - personalPercentage}%`,
                        backgroundColor: '#e7d791'
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
