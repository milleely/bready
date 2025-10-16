"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { SidebarNav } from "@/components/sidebar/sidebar-nav"
import { MobileNav } from "@/components/mobile-nav/mobile-nav"
import { BreadyLogo } from "@/components/bready-logo"
import { ExpenseForm } from "@/components/expense-form"
import { MonthSelector } from "@/components/month-selector"
import { Menu, X, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [storedCollapsed, setStoredCollapsed] = useState(false)
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)

  // URL-based month state management
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Load sidebar collapsed state from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored !== null) {
      setStoredCollapsed(stored === 'true')
    }
    setMounted(true)
  }, [])

  // Use default (false) until mounted, then use stored value
  const sidebarCollapsed = mounted ? storedCollapsed : false

  // Persist sidebar collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setStoredCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 shadow-sm hidden md:block transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section with Collapse Button */}
          <div className={cn(
            "border-b border-gray-200 transition-all duration-300",
            sidebarCollapsed ? "p-2 flex flex-col items-center gap-2" : "p-6 flex items-center justify-between"
          )}>
            <div className={cn(
              "flex items-center",
              sidebarCollapsed ? "justify-center" : "gap-3"
            )}>
              <BreadyLogo size={sidebarCollapsed ? 32 : 40} />
              {!sidebarCollapsed && (
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                    Bready
                  </h1>
                  <p className="text-xs text-muted-foreground">Track your dough</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="transition-all"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Add Expense Button */}
          <div className="px-4 pt-4 pb-2">
            <Button
              onClick={() => setExpenseFormOpen(true)}
              className={cn(
                "w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md",
                sidebarCollapsed && "px-0"
              )}
              title={sidebarCollapsed ? "Add Expense" : undefined}
            >
              <Plus className={cn("h-5 w-5", !sidebarCollapsed && "mr-2")} />
              {!sidebarCollapsed && "Add Expense"}
            </Button>
          </div>

          {/* Month Selector - Global Context */}
          {!sidebarCollapsed && (
            <div className="px-4 pt-2 pb-4 border-b border-gray-100">
              <MonthSelector
                selectedMonth={selectedMonth}
                onMonthChange={handleMonthChange}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarNav collapsed={sidebarCollapsed} />
          </div>

          {/* Bottom Section */}
          {!sidebarCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10"
                    }
                  }}
                />
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="p-2 border-t border-gray-200 flex justify-center">
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="fixed left-0 top-0 h-screen w-64 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Logo Section */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BreadyLogo size={40} />
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                      Bready
                    </h1>
                    <p className="text-xs text-muted-foreground">Track your dough</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <SidebarNav />
              </div>

              {/* Bottom Section */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                <MonthSelector
                  selectedMonth={selectedMonth}
                  onMonthChange={handleMonthChange}
                />
                <div className="flex items-center justify-center">
                  <UserButton
                    afterSignOutUrl="/sign-in"
                    appearance={{
                      elements: {
                        avatarBox: "w-10 h-10"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        sidebarCollapsed ? "md:ml-16" : "md:ml-64"
      )}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <BreadyLogo size={32} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                Bready
              </h1>
            </div>
            <UserButton
              afterSignOutUrl="/sign-in"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </div>
          {/* Add Expense Button */}
          <Button
            onClick={() => setExpenseFormOpen(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Expense Form Dialog */}
      {expenseFormOpen && (
        <ExpenseForm
          users={[]} // Will be passed from page context
          onSubmit={async () => {
            setExpenseFormOpen(false)
          }}
          open={expenseFormOpen}
          onOpenChange={setExpenseFormOpen}
        />
      )}
    </div>
  )
}
