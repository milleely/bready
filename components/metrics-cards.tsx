"use client"

import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, Users, Share2, TrendingUp } from "lucide-react"

interface MetricsCardsProps {
  totalSpent: number
  sharedExpenses: number
  userCount: number
  avgPerPerson: number
}

export const MetricsCards = memo(function MetricsCards({ totalSpent, sharedExpenses, userCount, avgPerPerson }: MetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-900">Total Spent</CardTitle>
          <DollarSign className="h-5 w-5 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-700">{formatCurrency(totalSpent)}</div>
          <p className="text-xs text-amber-600 mt-1">All expenses combined</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-900">Shared Expenses</CardTitle>
          <Share2 className="h-5 w-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-700">{formatCurrency(sharedExpenses)}</div>
          <p className="text-xs text-orange-600 mt-1">Split among all users</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-amber-900">Active Users</CardTitle>
          <Users className="h-5 w-5 text-amber-700" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-800">{userCount}</div>
          <p className="text-xs text-amber-700 mt-1">Contributing members</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-50 to-amber-100 border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-900">Avg Per Person</CardTitle>
          <TrendingUp className="h-5 w-5 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-700">{formatCurrency(avgPerPerson)}</div>
          <p className="text-xs text-yellow-600 mt-1">Average spending</p>
        </CardContent>
      </Card>
    </div>
  )
})
