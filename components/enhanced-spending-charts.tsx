"use client"

import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Label } from "recharts"

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

export const EnhancedSpendingCharts = React.memo(function EnhancedSpendingCharts({ spendingByCategory, spendingPerPerson }: SpendingChartsProps) {
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
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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

      {/* Card-Based Layout for Per-Person Spending */}
      <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-golden-crust-dark">Spending per Person</CardTitle>
          <CardDescription className="text-golden-crust-dark/70">Personal and shared expenses breakdown</CardDescription>
        </CardHeader>
        <CardContent className={`grid gap-4 ${spendingPerPerson.length >= 3 ? 'md:grid-cols-2' : ''}`}>
          {spendingPerPerson.map((person) => (
            <div
              key={person.name}
              className="bg-white/60 backdrop-blur-sm border-2 border-golden-crust-primary/40 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md"
                  style={{ backgroundColor: person.color }}
                >
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-golden-crust-dark">{person.name}</h3>
                  <p className="text-2xl font-extrabold text-golden-crust-primary">
                    {formatCurrency(person.total)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-golden-crust-primary/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-amber-600" />
                  <div>
                    <p className="text-xs font-semibold text-golden-crust-dark/70">Personal</p>
                    <p className="text-sm font-bold text-golden-crust-dark">
                      {formatCurrency(person.personal)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-golden-crust-dark/70">Shared</p>
                    <p className="text-sm font-bold text-golden-crust-dark">
                      {formatCurrency(person.shared)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
})
