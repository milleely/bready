"use client"

/**
 * Budget Allocation Card Component
 *
 * Displays recommended budget allocation based on selected rule
 * (50/30/20, Conservative, Moderate, or Aggressive).
 */

import { Card, CardContent } from "@/components/ui/card"
import { PieChart } from "lucide-react"
import type { BudgetAllocation } from "@/lib/types/networth"

interface BudgetAllocationCardProps {
  budgetAllocation: BudgetAllocation
}

export function BudgetAllocationCard({
  budgetAllocation,
}: BudgetAllocationCardProps) {
  const allocations = [
    {
      ...budgetAllocation.needs,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      ...budgetAllocation.wants,
      color: "bg-amber-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      ...budgetAllocation.savings,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-xl">
      <CardContent className="pt-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-amber-100">
            <PieChart className="h-5 w-5 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-stone-900">Your Budget Plan</h2>
            <p className="text-sm text-stone-600">50/30/20 (Balanced)</p>
          </div>
        </div>

        {/* Total Monthly Income */}
        <div className="mb-4 p-3 rounded-lg bg-white border border-[hsl(var(--border-light-crust))]">
          <p className="text-xs text-stone-600">Monthly Income</p>
          <p className="text-2xl font-bold text-stone-900">
            ${budgetAllocation.totalMonthlyIncome.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Allocation Breakdown */}
        <div className="space-y-3 mb-4">
          {allocations.map((allocation) => (
            <div
              key={allocation.label}
              className={`p-4 rounded-lg border border-[hsl(var(--border-light-crust))] ${allocation.bgColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${allocation.color}`} />
                  <span className="font-medium text-stone-900">{allocation.label}</span>
                </div>
                <span className={`text-sm font-semibold ${allocation.textColor}`}>
                  {allocation.percentage}%
                </span>
              </div>
              <p className={`text-2xl font-bold ${allocation.textColor}`}>
                ${allocation.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-stone-600 mt-1">per month</p>
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-auto p-3 rounded-lg bg-white border border-[hsl(var(--border-light-crust))]">
          <p className="text-xs text-stone-600">
            💡 <strong>Budget Allocation:</strong> Standard rule - balanced approach to needs, wants, and savings
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
