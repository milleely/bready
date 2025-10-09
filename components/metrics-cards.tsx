"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, Users, Share2, TrendingUp } from "lucide-react"

interface MetricsCardsProps {
  totalSpent: number
  sharedExpenses: number
  userCount: number
  avgPerPerson: number
}

export function MetricsCards({ totalSpent, sharedExpenses, userCount, avgPerPerson }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-950 dark:to-yellow-900 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Total Spent</CardTitle>
          <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">All expenses combined</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950 dark:to-amber-900 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-900 dark:text-orange-100">Shared Expenses</CardTitle>
          <Share2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">{formatCurrency(sharedExpenses)}</div>
          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Split among all users</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-950 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-900 dark:text-amber-100">Active Users</CardTitle>
          <Users className="h-5 w-5 text-amber-700 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">{userCount}</div>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Contributing members</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 dark:from-yellow-950 dark:to-amber-900 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Avg Per Person</CardTitle>
          <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{formatCurrency(avgPerPerson)}</div>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">Average spending</p>
        </CardContent>
      </Card>
    </div>
  )
}
