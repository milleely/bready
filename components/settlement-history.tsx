"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, History, Trash2, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useState, useEffect } from "react"

interface SettlementHistoryItem {
  id: string
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
  date: string // ISO timestamp
  month: string
  note: string | null
}

interface SettlementHistoryProps {
  history: SettlementHistoryItem[]
  onUnmark: (settlementId: string) => Promise<void>
}

export function SettlementHistory({ history, onUnmark }: SettlementHistoryProps) {
  const [historyOpen, setHistoryOpen] = useState(() => {
    // Load from localStorage or default to false (collapsed)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('settlement-history-open')
      return stored !== null ? stored === 'true' : false
    }
    return false
  })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Persist history open state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('settlement-history-open', String(historyOpen))
    }
  }, [historyOpen])

  const handleUnmark = async (settlementId: string, fromName: string, toName: string, amount: number) => {
    const confirmed = confirm(
      `Are you sure you want to unmark this settlement?\n\n${fromName} → ${toName}: ${formatCurrency(amount)}\n\nThis will make the settlement pending again.`
    )

    if (!confirmed) return

    setDeletingId(settlementId)
    try {
      await onUnmark(settlementId)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasHistory = history.length > 0

  return (
    <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
      <Card className="border-stone-200 bg-gradient-to-br from-stone-50/50 to-stone-100/50 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-stone-600" />
              <CardTitle className="text-stone-700">
                Settlement History
                {hasHistory && (
                  <span className="ml-2 text-sm font-normal text-stone-500">
                    ({history.length} {history.length === 1 ? 'payment' : 'payments'})
                  </span>
                )}
              </CardTitle>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-stone-100">
                {historyOpen ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {hasHistory ? (
              <div className="rounded-lg border border-stone-200 bg-white/60 backdrop-blur-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-stone-200">
                      <TableHead className="text-stone-700">Date Paid</TableHead>
                      <TableHead className="text-stone-700">From → To</TableHead>
                      <TableHead className="text-right text-stone-700">Amount</TableHead>
                      <TableHead className="text-right text-stone-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((settlement) => (
                      <TableRow key={settlement.id} className="hover:bg-stone-50/50 border-stone-200">
                        <TableCell className="text-stone-600 font-medium">
                          {formatDate(settlement.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                                style={{ backgroundColor: settlement.from.color }}
                              >
                                {settlement.from.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-stone-700 font-medium">
                                {settlement.from.name}
                              </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-stone-400 flex-shrink-0" />
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm"
                                style={{ backgroundColor: settlement.to.color }}
                              >
                                {settlement.to.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-stone-700 font-medium">
                                {settlement.to.name}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-stone-700 font-semibold">
                          {formatCurrency(settlement.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnmark(settlement.id, settlement.from.name, settlement.to.name, settlement.amount)}
                            disabled={deletingId === settlement.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {deletingId === settlement.id ? (
                              "Unmarking..."
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Unmark
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 bg-white/40 rounded-lg border border-stone-200">
                <History className="h-12 w-12 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600 font-medium mb-1">No settlement history</p>
                <p className="text-sm text-stone-500">
                  Completed settlements for this month will appear here
                </p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
