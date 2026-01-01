"use client"

import { useState, useEffect } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

interface MobileMonthPickerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedMonth: string // Format: YYYY-MM
  onMonthChange: (month: string) => void
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function MobileMonthPickerSheet({
  open,
  onOpenChange,
  selectedMonth,
  onMonthChange,
}: MobileMonthPickerSheetProps) {
  const [year, month] = selectedMonth.split('-').map(Number)
  const [pickerYear, setPickerYear] = useState(year)
  const today = new Date()

  // Reset picker year when sheet opens
  useEffect(() => {
    if (open) {
      setPickerYear(year)
    }
  }, [open, year])

  const handleMonthSelect = (monthIndex: number) => {
    const newMonth = `${pickerYear}-${String(monthIndex + 1).padStart(2, '0')}`
    onMonthChange(newMonth)
  }

  const goToCurrentMonth = () => {
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    onMonthChange(currentMonth)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-white">
        <DrawerHeader className="border-b border-amber-100 pb-4">
          <DrawerTitle className="text-lg font-semibold text-amber-900">
            Select Month
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4 space-y-6">
          {/* Year Selector */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-amber-300 hover:bg-amber-50 active:bg-amber-100 touch-manipulation"
              onClick={() => setPickerYear(pickerYear - 1)}
              aria-label="Previous year"
            >
              <ChevronDown className="h-6 w-6 text-amber-700" />
            </Button>
            <span className="text-2xl font-bold text-amber-900 min-w-[80px] text-center">
              {pickerYear}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-amber-300 hover:bg-amber-50 active:bg-amber-100 touch-manipulation"
              onClick={() => setPickerYear(pickerYear + 1)}
              aria-label="Next year"
            >
              <ChevronUp className="h-6 w-6 text-amber-700" />
            </Button>
          </div>

          {/* Month Grid - 3x4 with touch-friendly 48px+ cells */}
          <div className="grid grid-cols-3 gap-3">
            {monthNames.map((monthName, index) => {
              const isSelected = index === month - 1 && pickerYear === year
              const isCurrent = index === today.getMonth() && pickerYear === today.getFullYear()

              return (
                <Button
                  key={monthName}
                  variant={isSelected ? "default" : "outline"}
                  className={`
                    h-14 text-base font-medium touch-manipulation
                    ${isSelected
                      ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white'
                      : 'border-amber-200 hover:bg-amber-50 active:bg-amber-100 text-stone-700'
                    }
                    ${isCurrent && !isSelected ? 'ring-2 ring-amber-400 ring-offset-1' : ''}
                  `}
                  onClick={() => handleMonthSelect(index)}
                  aria-label={`${monthName} ${pickerYear}${isSelected ? ', currently selected' : ''}${isCurrent ? ', current month' : ''}`}
                >
                  {monthName.slice(0, 3)}
                </Button>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-amber-100">
            <Button
              variant="ghost"
              className="w-full h-12 text-amber-700 hover:bg-amber-50 active:bg-amber-100 font-medium touch-manipulation"
              onClick={goToCurrentMonth}
            >
              Go to Current Month
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
