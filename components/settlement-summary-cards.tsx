"use client"

import { formatCurrency } from "@/lib/utils"
import { CheckCircle2, Wallet } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"

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
      <StatCard
        label="Outstanding"
        value={formatCurrency(outstandingAmount)}
        icon={Wallet}
        tone="amber"
        trend={
          pendingCount > 0
            ? {
                direction: "flat",
                delta: `${pendingCount} ${pendingCount === 1 ? "settlement" : "settlements"} pending`,
              }
            : undefined
        }
      />
      <StatCard
        label="Settled this month"
        value={formatCurrency(settledAmount)}
        icon={CheckCircle2}
        tone="success"
        trend={
          settledCount > 0
            ? {
                direction: "flat",
                delta: `${settledCount} ${settledCount === 1 ? "payment" : "payments"} completed`,
              }
            : undefined
        }
      />
    </div>
  )
}
