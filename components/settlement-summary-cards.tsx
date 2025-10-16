"use client"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, CheckCircle2 } from "lucide-react"

interface Settlement {
  from: { id: string; name: string; color: string }
  to: { id: string; name: string; color: string }
  amount: number
}

interface SettlementSummaryCardsProps {
  pendingSettlements: Settlement[]
  settledCount?: number
  settledAmount?: number
}

export function SettlementSummaryCards({
  pendingSettlements,
  settledCount = 0,
  settledAmount = 0,
}: SettlementSummaryCardsProps) {
  const outstandingAmount = pendingSettlements.reduce(
    (sum, s) => sum + s.amount,
    0
  )
  const pendingCount = pendingSettlements.length

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Outstanding Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-amber-700" />
                <h3 className="text-sm font-semibold text-amber-900">
                  Outstanding
                </h3>
              </div>
              <p className="text-3xl font-bold text-amber-900">
                {formatCurrency(outstandingAmount)}
              </p>
              <p className="text-sm text-amber-700 mt-1">
                {pendingCount} {pendingCount === 1 ? "settlement" : "settlements"} pending
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-amber-200/50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-amber-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settled Card */}
      <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                <h3 className="text-sm font-semibold text-emerald-900">
                  Settled This Month
                </h3>
              </div>
              <p className="text-3xl font-bold text-emerald-900">
                {formatCurrency(settledAmount)}
              </p>
              <p className="text-sm text-emerald-700 mt-1">
                {settledCount} {settledCount === 1 ? "payment" : "payments"} completed
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-emerald-200/50 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-700" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
