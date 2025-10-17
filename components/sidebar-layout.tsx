"use client"

import { useState, useEffect } from "react"
import { UserButton } from "@clerk/nextjs"
import { SidebarNav } from "@/components/sidebar/sidebar-nav"
import { MobileNav } from "@/components/mobile-nav/mobile-nav"
import { BreadyLogo } from "@/components/bready-logo"
import { ExpenseForm } from "@/components/expense-form"
import { MonthSelector } from "@/components/month-selector"
import { KeyboardShortcutsNavigation } from "@/components/keyboard-shortcuts-dialog"
import { Menu, X, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarLayoutProps {
  children: React.ReactNode
  selectedMonth: string
  onMonthChange: (month: string) => void
}

interface User {
  id: string
  name: string
  color: string
}

export function SidebarLayout({ children, selectedMonth, onMonthChange }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [storedCollapsed, setStoredCollapsed] = useState(false)
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])

  // Load sidebar collapsed state from localStorage after hydration
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-collapsed')
    if (stored !== null) {
      setStoredCollapsed(stored === 'true')
    }
    setMounted(true)
  }, [])

  // Fetch users for expense form
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const usersData = await response.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }
    fetchUsers()
  }, [])

  // Use default (false) until mounted, then use stored value
  const sidebarCollapsed = mounted ? storedCollapsed : false

  // Persist sidebar collapsed state to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setStoredCollapsed(newState)
    localStorage.setItem('sidebar-collapsed', String(newState))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-[hsl(var(--border-light-crust))] shadow-sm hidden md:block transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section with Collapse Button */}
          <div className={cn(
            "border-b border-[hsl(var(--border-light-crust))] transition-all duration-300",
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
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
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
            <div className="px-4 pt-2 pb-4 border-b border-[hsl(var(--border-light-crust))]">
              <MonthSelector
                selectedMonth={selectedMonth}
                onMonthChange={onMonthChange}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarNav collapsed={sidebarCollapsed} />
          </div>

          {/* Bottom Section */}
          {mounted && !sidebarCollapsed && (
            <div className="p-4 border-t border-[hsl(var(--border-light-crust))]">
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
          {mounted && sidebarCollapsed && (
            <div className="p-2 border-t border-[hsl(var(--border-light-crust))] flex justify-center">
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
              <div className="p-6 border-b border-[hsl(var(--border-light-crust))] flex items-center justify-between">
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
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <SidebarNav />
              </div>

              {/* Bottom Section */}
              <div className="p-4 border-t border-[hsl(var(--border-light-crust))] space-y-3">
                <MonthSelector
                  selectedMonth={selectedMonth}
                  onMonthChange={onMonthChange}
                />
                {mounted && (
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
                )}
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
        <header className="sticky top-0 z-30 bg-white border-b border-[hsl(var(--border-light-crust))] px-4 py-3 md:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <BreadyLogo size={32} />
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                Bready
              </h1>
            </div>
            {mounted && (
              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }}
              />
            )}
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
          users={users}
          onSubmit={async (expense) => {
            try {
              const response = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(expense),
              })

              if (response.ok) {
                setExpenseFormOpen(false)
                // Dispatch custom event to notify pages to refresh
                window.dispatchEvent(new CustomEvent('expenseAdded'))
              } else {
                const error = await response.json()
                alert(error.error || 'Failed to add expense. Please try again.')
              }
            } catch (error) {
              console.error('Failed to add expense:', error)
              alert('Failed to add expense. Please try again.')
            }
          }}
          open={expenseFormOpen}
          onOpenChange={setExpenseFormOpen}
        />
      )}

      {/* Keyboard Shortcuts Navigation (? key to Settings) */}
      <KeyboardShortcutsNavigation />
    </div>
  )
}
