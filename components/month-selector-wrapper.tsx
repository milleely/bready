"use client"

import { Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"

interface MonthSelectorWrapperProps {
  children: React.ReactNode
}

// Loading fallback for Suspense
function LoadingLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout
      selectedMonth={(() => {
        const today = new Date()
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
      })()}
      onMonthChange={() => {}}
    >
      {children}
    </SidebarLayout>
  )
}

// Client component that uses useSearchParams (wrapped in Suspense)
function MonthSelectorClient({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Get current month from URL or default to current
  const getCurrentMonth = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  }

  const selectedMonth = searchParams.get('month') || getCurrentMonth()

  // Handle month change by updating URL
  const handleMonthChange = (newMonth: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', newMonth)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <SidebarLayout
      selectedMonth={selectedMonth}
      onMonthChange={handleMonthChange}
    >
      {children}
    </SidebarLayout>
  )
}

// Main wrapper component with Suspense boundary
export function MonthSelectorWrapper({ children }: MonthSelectorWrapperProps) {
  return (
    <Suspense fallback={<LoadingLayout>{children}</LoadingLayout>}>
      <MonthSelectorClient>{children}</MonthSelectorClient>
    </Suspense>
  )
}
