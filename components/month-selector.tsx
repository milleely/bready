"use client"

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MonthSelectorProps {
  selectedMonth: string // Format: YYYY-MM
  onMonthChange: (month: string) => void
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  // Parse the current month
  const [year, month] = selectedMonth.split('-').map(Number)
  const date = new Date(year, month - 1)

  // Format for display
  const displayMonth = date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  // Navigation functions
  const goToPrevMonth = () => {
    const newDate = new Date(year, month - 2) // month - 2 because month is 1-indexed and we want previous
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const goToNextMonth = () => {
    const newDate = new Date(year, month) // month gives us next month (since 0-indexed + 1)
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const goToCurrentMonth = () => {
    const today = new Date()
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(currentMonth)
  }

  // Check if we're viewing current month
  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  return (
    <div className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 border-2 border-amber-300 shadow-sm">
      <Calendar className="h-4 w-4 text-amber-700" />

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-amber-100"
        onClick={goToPrevMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4 text-amber-700" />
      </Button>

      <span className="text-sm font-semibold text-amber-900 min-w-[140px] text-center">
        {displayMonth}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-amber-100"
        onClick={goToNextMonth}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4 text-amber-700" />
      </Button>

      {!isCurrentMonth && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs border-amber-400 text-amber-800 hover:bg-amber-100"
          onClick={goToCurrentMonth}
        >
          Today
        </Button>
      )}
    </div>
  )
}
