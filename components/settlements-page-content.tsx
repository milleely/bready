"use client"

import { Suspense, useEffect, useState } from "react"
import { SettlementCard } from "@/components/settlement-card"
import { SettlementSummaryCards } from "@/components/settlement-summary-cards"
import { SettlementHistory } from "@/components/settlement-history"
import { BreadyLogo } from "@/components/bready-logo"
import { CheckCircle2, Wallet } from "lucide-react"

interface Settlement {
  from: { id: string; name: string; color: string }
  to: { id: string; name: string; color: string }
  amount: number
}

interface SettlementHistoryItem {
  id: string
  from: { id: string; name: string; color: string }
  to: { id: string; name: string; color: string }
  amount: number
  date: string
  month: string
  note: string | null
}

interface SettlementsPageContentProps {
  month?: string
}

export function SettlementsPageContent({ month }: SettlementsPageContentProps) {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [settlementHistory, setSettlementHistory] = useState<SettlementHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  // Get current month
  const getCurrentMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
  }

  // Get selected month from prop or default to current
  const selectedMonth = month || getCurrentMonth()

  // Format month for display (e.g., "September 2024")
  const getMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-').map(Number)
    const date = new Date(year, month - 1)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const fetchSettlements = async () => {
    try {
      const [year, month] = selectedMonth.split("-").map(Number)
      const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0]
      const endDate = new Date(year, month, 0).toISOString().split("T")[0]

      const response = await fetch(
        `/api/settlements?startDate=${startDate}&endDate=${endDate}`
      )
      const data = await response.json()
      setSettlements(data)
    } catch (error) {
      console.error("Failed to fetch settlements:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/settlements/history?month=${selectedMonth}`)
      const data = await response.json()
      setSettlementHistory(data)
    } catch (error) {
      console.error("Failed to fetch settlement history:", error)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    await Promise.all([fetchSettlements(), fetchHistory()])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [selectedMonth])

  const handleMarkAsPaid = async (settlement: Settlement) => {
    try {
      const response = await fetch("/api/settlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromUserId: settlement.from.id,
          toUserId: settlement.to.id,
          amount: settlement.amount,
          month: selectedMonth,
        }),
      })

      if (response.ok) {
        // Refresh both settlements and history after marking as paid
        await fetchData()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to record settlement")
      }
    } catch (error) {
      console.error("Failed to mark settlement as paid:", error)
      alert("Failed to record settlement. Please try again.")
    }
  }

  const handleUnmark = async (settlementId: string) => {
    try {
      const response = await fetch(`/api/settlements/${settlementId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refresh both settlements and history after unmarking
        await fetchData()
      } else {
        const error = await response.json()
        alert(error.error || "Failed to unmark settlement")
      }
    } catch (error) {
      console.error("Failed to unmark settlement:", error)
      alert("Failed to unmark settlement. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Wallet className="h-12 w-12 animate-pulse mx-auto mb-4 text-amber-600" />
          <p className="text-muted-foreground">Loading settlements...</p>
        </div>
      </div>
    )
  }

  const hasSettlements = settlements.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{getMonthName(selectedMonth)} Settlements</h1>
        <p className="text-muted-foreground mt-1">
          Balance shared expenses for {getMonthName(selectedMonth)}
        </p>
      </div>

      {/* Summary Cards */}
      <SettlementSummaryCards
        pendingSettlements={settlements}
        settledCount={settlementHistory.length}
        settledAmount={settlementHistory.reduce((sum, s) => sum + s.amount, 0)}
      />

      {/* Pending Settlements */}
      {hasSettlements ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Pending Settlements
            </h2>
            <p className="text-sm text-gray-600">
              These settlements need to be paid to balance shared expenses.
            </p>
          </div>
          <SettlementCard
            settlements={settlements}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
      ) : (
        // Empty State - All Settled Up
        <div className="bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100 border-0 shadow-xl rounded-lg p-12">
          <div className="text-center">
            <div className="mb-6">
              <BreadyLogo size={80} />
            </div>
            <div className="mb-4">
              <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Fresh Out of the Oven!
            </h2>
            <p className="text-lg text-gray-700 max-w-md mx-auto mb-2">
              Everyone is settled up for {getMonthName(selectedMonth)}.
            </p>
            <p className="text-gray-600 max-w-md mx-auto">
              Your household finances are perfectly balanced.
            </p>
          </div>
        </div>
      )}

      {/* Settlement History */}
      <SettlementHistory
        history={settlementHistory}
        onUnmark={handleUnmark}
      />
    </div>
  )
}
