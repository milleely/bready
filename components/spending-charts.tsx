"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { categories, formatCurrency } from "@/lib/utils"

interface SpendingChartsProps {
  spendingByCategory: Array<{ category: string; amount: number }>
  spendingPerPerson: Array<{ name: string; total: number; shared: number; personal: number; color: string }>
}

export function SpendingCharts({ spendingByCategory, spendingPerPerson }: SpendingChartsProps) {
  const categoryColors = categories.reduce((acc, cat) => {
    acc[cat.value] = cat.color
    return acc
  }, {} as Record<string, string>)

  const categoryData = spendingByCategory.map(item => ({
    name: categories.find(c => c.value === item.category)?.label || item.category,
    value: item.amount,
    color: categoryColors[item.category] || '#6b7280'
  }))

  const personData = spendingPerPerson.map(person => ({
    name: person.name,
    Personal: person.personal,
    Shared: person.shared,
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const BarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{payload[0].payload.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending per Person</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={personData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<BarTooltip />} />
              <Legend />
              <Bar dataKey="Personal" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Shared" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
