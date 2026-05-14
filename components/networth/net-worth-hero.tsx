"use client"

/**
 * Net Worth Hero Card Component
 *
 * Displays the user's financial summary at a glance:
 * - Total Net Worth
 * - Total Assets
 * - Total Liabilities
 * - Monthly Savings Rate
 */

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Pencil } from "lucide-react"
import type { NetWorthSummary } from "@/lib/types/networth"

interface NetWorthHeroProps {
  summary: NetWorthSummary
  previousSummary?: NetWorthSummary | null
  onEditExpenses?: () => void
}

export function NetWorthHero({ summary, previousSummary, onEditExpenses }: NetWorthHeroProps) {
  const isPositiveSavings = summary.monthlySavingsRate >= 0
  const savingsRateColor = isPositiveSavings ? "text-emerald-600" : "text-red-600"

  // Trend calculations for Net Worth
  const hasPreviousData = previousSummary !== null && previousSummary !== undefined
  const netWorthChange = hasPreviousData ? summary.netWorth - previousSummary.netWorth : 0
  const netWorthChangePercent = hasPreviousData && previousSummary.netWorth !== 0
    ? ((netWorthChange / Math.abs(previousSummary.netWorth)) * 100).toFixed(1)
    : "0"
  const isNetWorthUp = netWorthChange >= 0

  return (
    <Card className="border border-stone-200 bg-card shadow-sm dark:border-stone-800">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-amber-100">
            <DollarSign className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-stone-900">
              {summary.netWorth >= 0 ? "$" : "-$"}
              {Math.abs(summary.netWorth).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h2>
            {/* Total Net Worth label + trend indicator on same line */}
            <div className="flex items-center gap-3">
              <p className="text-sm text-stone-600">Total Net Worth</p>
              <div className="flex items-center gap-2">
                {hasPreviousData ? (
                  <>
                    {isNetWorthUp ? (
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${isNetWorthUp ? "text-emerald-600" : "text-red-600"}`}>
                      {isNetWorthUp ? "+" : "-"}$
                      {Math.abs(netWorthChange).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs text-stone-500">
                      ({isNetWorthUp ? "+" : ""}{netWorthChangePercent}% vs last month)
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-stone-500">No data from last month</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Assets */}
          <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-emerald-50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-stone-700">Assets</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              ${summary.totalAssets.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Total Liabilities */}
          <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-red-50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-stone-700">Liabilities</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              ${summary.totalLiabilities.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Monthly Savings Rate */}
          <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-stone-700">Savings Rate</span>
            </div>
            <p className={`text-2xl font-bold ${savingsRateColor}`}>
              {summary.monthlySavingsRate.toFixed(1)}%
            </p>
            <p className="text-xs text-stone-600 mt-1">
              {isPositiveSavings ? "Saving" : "Spending"} $
              {Math.abs(summary.monthlyIncome - summary.monthlyExpenses).toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              per month
            </p>
          </div>
        </div>

        {/* Income vs Expenses */}
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Income */}
            <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-emerald-50">
              <p className="text-sm font-medium text-stone-700 mb-2">Monthly Income</p>
              <p className="text-2xl font-bold text-emerald-600">
                ${summary.monthlyIncome.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
            {/* Monthly Expenses */}
            <div className="p-4 rounded-lg border border-stone-200 dark:border-stone-800 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-medium text-stone-700">Monthly Expenses</p>
                {onEditExpenses && (
                  <Button
                    onClick={onEditExpenses}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs hover:bg-amber-100 dark:hover:bg-amber-950/40"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              <p className="text-2xl font-bold text-red-600">
                ${summary.monthlyExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
