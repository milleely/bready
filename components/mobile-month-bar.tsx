"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MobileMonthPickerSheet } from "@/components/mobile-month-picker-sheet"

interface MobileMonthBarProps {
  selectedMonth: string // Format: YYYY-MM
  onMonthChange: (month: string) => void
}

export function MobileMonthBar({ selectedMonth, onMonthChange }: MobileMonthBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

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
    const newDate = new Date(year, month - 2)
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const goToNextMonth = () => {
    const newDate = new Date(year, month)
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  return (
    <>
      <nav
        role="navigation"
        aria-label="Month navigation"
        className="flex items-center justify-between bg-stone-100 dark:bg-stone-900 rounded-lg px-2 py-1 border border-stone-200 dark:border-stone-800 shadow-sm mb-3"
      >
        {/* Previous Month Button - 48px touch target */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 hover:bg-amber-100 dark:hover:bg-amber-950/40 active:bg-amber-200 dark:active:bg-amber-900/40 touch-manipulation"
          onClick={goToPrevMonth}
          aria-label="Go to previous month"
        >
          <ChevronLeft className="h-6 w-6 text-amber-700" />
        </Button>

        {/* Center: Calendar icon + Month display */}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-amber-100 dark:hover:bg-amber-950/40 active:bg-amber-200 dark:active:bg-amber-900/40 transition-colors touch-manipulation"
          aria-label={`Current month: ${displayMonth}. Tap to open month picker`}
        >
          <CalendarIcon className="h-5 w-5 text-amber-700" />
          <span className="text-base font-semibold text-amber-900">
            {displayMonth}
          </span>
        </button>

        {/* Next Month Button - 48px touch target */}
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 hover:bg-amber-100 dark:hover:bg-amber-950/40 active:bg-amber-200 dark:active:bg-amber-900/40 touch-manipulation"
          onClick={goToNextMonth}
          aria-label="Go to next month"
        >
          <ChevronRight className="h-6 w-6 text-amber-700" />
        </Button>
      </nav>

      {/* Full Month Picker Sheet */}
      <MobileMonthPickerSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        selectedMonth={selectedMonth}
        onMonthChange={(month) => {
          onMonthChange(month)
          setSheetOpen(false)
        }}
      />
    </>
  )
}
