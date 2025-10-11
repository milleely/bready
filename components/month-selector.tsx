"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MonthSelectorProps {
  selectedMonth: string // Format: YYYY-MM
  onMonthChange: (month: string) => void
}

export function MonthSelector({ selectedMonth, onMonthChange }: MonthSelectorProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)

  // Parse the current month
  const [year, month] = selectedMonth.split('-').map(Number)
  const [pickerYear, setPickerYear] = useState(year)
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

  const handleMonthSelect = (monthIndex: number, yearValue: number) => {
    const newMonth = `${yearValue}-${String(monthIndex + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
    setCalendarOpen(false)
  }

  // Month names for the picker
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Check if we're viewing current month
  const today = new Date()
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1

  return (
    <div className="flex items-center gap-1 bg-white/80 rounded-lg px-2 py-1.5 border-2 border-amber-300 shadow-sm">
      <Popover open={calendarOpen} onOpenChange={(open) => {
        setCalendarOpen(open)
        if (open) {
          setPickerYear(year)
        }
      }}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-amber-100"
            aria-label="Open calendar"
          >
            <CalendarIcon className="h-4 w-4 text-amber-700 cursor-pointer" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4 bg-white border-2 border-amber-200" align="center">
          <div className="space-y-4">
            {/* Year selector */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Year</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-amber-300 hover:bg-amber-50"
                  onClick={() => setPickerYear(pickerYear - 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <span className="text-lg font-bold text-amber-900 min-w-[60px] text-center">
                  {pickerYear}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-amber-300 hover:bg-amber-50"
                  onClick={() => setPickerYear(pickerYear + 1)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Month grid */}
            <div>
              <span className="text-sm font-semibold text-gray-700">Month</span>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {monthNames.map((monthName, index) => {
                  const isSelected = index === month - 1 && pickerYear === year
                  const isCurrent = index === today.getMonth() && pickerYear === today.getFullYear()

                  return (
                    <Button
                      key={monthName}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`
                        ${isSelected
                          ? 'bg-amber-600 hover:bg-amber-700 text-white font-semibold'
                          : 'border-amber-200 hover:bg-amber-50 text-gray-700'
                        }
                        ${isCurrent && !isSelected ? 'ring-2 ring-amber-400' : ''}
                      `}
                      onClick={() => handleMonthSelect(index, pickerYear)}
                    >
                      {monthName.slice(0, 3)}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex justify-between pt-2 border-t border-amber-100">
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-700 hover:bg-amber-50"
                onClick={() => {
                  const now = new Date()
                  handleMonthSelect(now.getMonth(), now.getFullYear())
                }}
              >
                Current Month
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-amber-100"
        onClick={goToPrevMonth}
        aria-label="Previous month"
      >
        <ChevronLeft className="h-4 w-4 text-amber-700" />
      </Button>

      <div className="w-[140px] text-center">
        <span className="text-sm font-semibold text-amber-900">
          {displayMonth}
        </span>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 hover:bg-amber-100"
        onClick={goToNextMonth}
        aria-label="Next month"
      >
        <ChevronRight className="h-4 w-4 text-amber-700" />
      </Button>
    </div>
  )
}
