"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, Users, Share2, TrendingUp, Info } from "lucide-react"

interface MetricsCardsProps {
  totalSpent: number
  sharedExpenses: number
  userCount: number
  avgPerPerson: number
}

export function EnhancedMetricsCards({ totalSpent, sharedExpenses, userCount, avgPerPerson }: MetricsCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Spent Card */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="border-0 shadow-md cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #e3c462 0%, #fdf885 100%)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: '#604b21' }}>Total Spent</CardTitle>
              <DollarSign className="h-5 w-5" style={{ color: '#604b21' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#604b21' }}>{formatCurrency(totalSpent)}</div>
              <p className="text-xs mt-1 flex items-center gap-1 font-medium" style={{ color: '#604b21' }}>
                All expenses combined
                <Info className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent
          className="w-80 bg-white border-gray-200 shadow-xl"
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Total Spending Overview</h4>
            <p className="text-sm text-gray-600">
              This represents all expenses tracked in the current month, including both personal and shared costs.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 font-medium">
              <DollarSign className="h-3 w-3" />
              <span>Hover over cards for more details</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Shared Expenses Card */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="border-0 shadow-md cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #fdf885 0%, #e7d791 100%)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: '#604b21' }}>Shared Expenses</CardTitle>
              <Share2 className="h-5 w-5" style={{ color: '#604b21' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#604b21' }}>{formatCurrency(sharedExpenses)}</div>
              <p className="text-xs mt-1 flex items-center gap-1 font-medium" style={{ color: '#604b21' }}>
                Split among all users
                <Info className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent
          className="w-80 bg-white border-gray-200 shadow-xl"
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Shared Expenses Breakdown</h4>
            <p className="text-sm text-gray-600">
              These expenses are split equally among all household members. Each person's portion is automatically calculated.
            </p>
            {userCount > 0 && (
              <div className="text-xs text-gray-700 pt-2 font-semibold bg-amber-50 rounded px-2 py-1">
                Each person's share: {formatCurrency(sharedExpenses / userCount)}
              </div>
            )}
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Active Users Card */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="border-0 shadow-md cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #e7d791 0%, #e3c462 100%)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: '#604b21' }}>Active Users</CardTitle>
              <Users className="h-5 w-5" style={{ color: '#604b21' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#604b21' }}>{userCount}</div>
              <p className="text-xs mt-1 flex items-center gap-1 font-medium" style={{ color: '#604b21' }}>
                Contributing members
                <Info className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent
          className="w-80 bg-white border-gray-200 shadow-xl"
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Household Members</h4>
            <p className="text-sm text-gray-600">
              The number of people currently sharing expenses in your household. Add or remove members from the User Management section.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>

      {/* Avg Per Person Card */}
      <HoverCard>
        <HoverCardTrigger asChild>
          <Card className="border-0 shadow-md cursor-pointer transition-all hover:shadow-xl hover:-translate-y-1" style={{ background: 'linear-gradient(135deg, #e3c462 0%, #e7d791 100%)' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold" style={{ color: '#604b21' }}>Avg Per Person</CardTitle>
              <TrendingUp className="h-5 w-5" style={{ color: '#604b21' }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: '#604b21' }}>{formatCurrency(avgPerPerson)}</div>
              <p className="text-xs mt-1 flex items-center gap-1 font-medium" style={{ color: '#604b21' }}>
                Average spending
                <Info className="h-3 w-3" />
              </p>
            </CardContent>
          </Card>
        </HoverCardTrigger>
        <HoverCardContent
          className="w-80 bg-white border-gray-200 shadow-xl"
          side="bottom"
          sideOffset={8}
        >
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Average Spending Per Person</h4>
            <p className="text-sm text-gray-600">
              This is calculated by dividing the total household spending by the number of active members.
            </p>
            <div className="text-xs text-gray-700 pt-2 font-medium bg-blue-50 rounded px-2 py-1">
              Formula: {formatCurrency(totalSpent)} ÷ {userCount} users
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}
