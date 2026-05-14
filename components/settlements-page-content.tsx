"use client"

import { Suspense, useEffect, useState } from "react"
import { SettlementCard } from "@/components/settlement-card"
import { SettlementSummaryCards } from "@/components/settlement-summary-cards"
import { SettlementHistory } from "@/components/settlement-history"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { SectionHeading } from "@/components/ui/section-heading"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

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

  // Listen for expense changes from other pages
  useEffect(() => {
    const handleExpenseChange = () => {
      fetchData()
    }

    window.addEventListener('expenseAdded', handleExpenseChange)
    window.addEventListener('expenseEdited', handleExpenseChange)
    window.addEventListener('expenseDeleted', handleExpenseChange)

    return () => {
      window.removeEventListener('expenseAdded', handleExpenseChange)
      window.removeEventListener('expenseEdited', handleExpenseChange)
      window.removeEventListener('expenseDeleted', handleExpenseChange)
    }
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
        toast.error(error.error || "Failed to record settlement")
      }
    } catch (error) {
      console.error("Failed to mark settlement as paid:", error)
      toast.error("Failed to record settlement. Please try again.")
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
        toast.error(error.error || "Failed to unmark settlement")
      }
    } catch (error) {
      console.error("Failed to unmark settlement:", error)
      toast.error("Failed to unmark settlement. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6" role="status" aria-busy="true">
        <span className="sr-only">Loading settlements</span>
        {/* PageHeader skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* SettlementSummaryCards — 2-col StatCards (Outstanding + Settled this month) */}
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-card p-5 shadow-sm dark:border-stone-800"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-4 rounded-sm" />
              </div>
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-5 w-40 rounded-md" />
            </div>
          ))}
        </div>

        {/* SectionHeading + Pending settlements card */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
          <div className="rounded-xl border border-stone-200 bg-card shadow-sm dark:border-stone-800 p-6 space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 rounded-lg border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/50"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <Skeleton className="h-9 w-24 rounded-md flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const hasSettlements = settlements.length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${getMonthName(selectedMonth)} settlements`}
        description="Who owes whom."
      />

      {/* Summary Cards */}
      <SettlementSummaryCards
        pendingSettlements={settlements}
        settledCount={settlementHistory.length}
        settledAmount={settlementHistory.reduce((sum, s) => sum + s.amount, 0)}
      />

      {/* Pending Settlements */}
      {hasSettlements ? (
        <div className="space-y-4">
          <SectionHeading
            title="Pending settlements"
            description="Pay these to balance shared expenses."
          />
          <SettlementCard
            settlements={settlements}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </div>
      ) : (
        <EmptyState
          icon={CheckCircle2}
          title="Nothing to settle"
          description={`Everyone's even for ${getMonthName(selectedMonth)}.`}
          className="rounded-xl border border-stone-200 bg-card dark:border-stone-800"
        />
      )}

      {/* Settlement History */}
      <SettlementHistory
        history={settlementHistory}
        onUnmark={handleUnmark}
      />
    </div>
  )
}
