"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { ArrowRight, ArrowDown, CheckCircle2, DollarSign, Check } from "lucide-react"
import { useState } from "react"

interface Settlement {
  from: {
    id: string
    name: string
    color: string
  }
  to: {
    id: string
    name: string
    color: string
  }
  amount: number
}

interface SettlementCardProps {
  settlements: Settlement[]
  onMarkAsPaid?: (settlement: Settlement) => Promise<void>
}

export function SettlementCard({ settlements, onMarkAsPaid }: SettlementCardProps) {
  const [processingId, setProcessingId] = useState<string | null>(null)
  const hasSettlements = settlements.length > 0

  const handleMarkAsPaid = async (settlement: Settlement) => {
    if (!onMarkAsPaid) return

    const confirmed = confirm(
      `Confirm that ${settlement.from.name} has paid you ${formatCurrency(settlement.amount)}?`
    )

    if (!confirmed) return

    const settlementId = `${settlement.from.id}-${settlement.to.id}`
    setProcessingId(settlementId)

    try {
      await onMarkAsPaid(settlement)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <Card className="border border-stone-200 bg-card shadow-sm dark:border-stone-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 dark:bg-amber-950/40 rounded-lg">
            <DollarSign className="h-6 w-6 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-stone-900 dark:text-stone-100">Settle Up</CardTitle>
            <CardDescription className="text-stone-600 dark:text-stone-400">
              {hasSettlements
                ? "Balance settlements for shared expenses"
                : "Everyone is settled up!"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasSettlements ? (
          <div className="space-y-3">
            {settlements.map((settlement, index) => {
              const settlementId = `${settlement.from.id}-${settlement.to.id}`
              const isProcessing = processingId === settlementId

              return (
                <div
                  key={`${settlement.from.id}-${settlement.to.id}-${index}`}
                  className="bg-white/60 dark:bg-stone-950/50 backdrop-blur-sm border-2 border-stone-200 dark:border-stone-800 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:grid sm:grid-cols-3 items-center gap-4">
                    {/* From User */}
                    <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0"
                        style={{ backgroundColor: settlement.from.color }}
                      >
                        {settlement.from.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                          {settlement.from.name}
                        </p>
                        <p className="text-xs text-stone-600 dark:text-stone-400">owes</p>
                      </div>
                    </div>

                    {/* Arrow and Amount - Centered */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 whitespace-nowrap">
                          {formatCurrency(settlement.amount)}
                        </p>
                      </div>
                      {/* Down arrow on mobile, right arrow on desktop */}
                      <ArrowDown className="h-6 w-6 text-amber-700 dark:text-amber-400 flex-shrink-0 sm:hidden" />
                      <ArrowRight className="h-6 w-6 text-amber-700 dark:text-amber-400 flex-shrink-0 hidden sm:block" />
                    </div>

                    {/* To User + Button */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                      <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                        <div className="flex-1 min-w-0 sm:text-right">
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
                            {settlement.to.name}
                          </p>
                          <p className="text-xs text-stone-600 dark:text-stone-400">receives</p>
                        </div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0"
                          style={{ backgroundColor: settlement.to.color }}
                        >
                          {settlement.to.name.charAt(0).toUpperCase()}
                        </div>
                      </div>

                      {/* Mark as Paid Button */}
                      {onMarkAsPaid && (
                        <Button
                          onClick={() => handleMarkAsPaid(settlement)}
                          disabled={isProcessing}
                          size="sm"
                          className="toast-gradient-golden hover:toast-gradient-dark text-white font-semibold shadow-md w-full sm:w-auto transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        >
                          {isProcessing ? (
                            "Processing..."
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Mark as Paid
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div className="text-xs text-stone-900 dark:text-stone-100/60 text-center mt-4 font-medium">
              {settlements.length} {settlements.length === 1 ? 'settlement' : 'settlements'} needed
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 toast-texture-subtle mb-4">
              <CheckCircle2 className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
              All Settled Up!
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              No outstanding balances for shared expenses this month.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
