"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { SidebarNav } from "@/components/sidebar/sidebar-nav"
import { MobileNav } from "@/components/mobile-nav/mobile-nav"
import { BreadyLogo } from "@/components/bready-logo"
import { ExpenseForm } from "@/components/expense-form"
import { RecurringExpenseForm } from "@/components/recurring-expense-form"
import { MonthSelector } from "@/components/month-selector"
import { MobileMonthBar } from "@/components/mobile-month-bar"
import { KeyboardShortcutsNavigation } from "@/components/keyboard-shortcuts-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { PageTransition } from "@/components/ui/page-transition"
import { X, Plus, ChevronLeft, ChevronRight, ChevronDown, Repeat, Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
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
  const [recurringFormOpen, setRecurringFormOpen] = useState(false)
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

  const pathname = usePathname()
  const settingsActive = pathname === "/settings" || pathname.startsWith("/settings/")

  return (
    <div className="min-h-screen surface-page-warm">
      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-stone-200 dark:border-stone-800 shadow-sm hidden md:block transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Section with Collapse Button */}
          <div className={cn(
            "transition-all duration-300",
            sidebarCollapsed ? "p-3 flex flex-col items-center gap-2" : "px-5 py-5 flex items-center justify-between"
          )}>
            <Link href="/dashboard" className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-2")}>
              <BreadyLogo size={sidebarCollapsed ? 28 : 28} />
              {!sidebarCollapsed && (
                <h1 className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
                  Bready
                </h1>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-7 w-7 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Primary CTA — single split button */}
          <div className="px-3 pb-3">
            {!sidebarCollapsed ? (
              <div className="flex w-full">
                <Button
                  onClick={() => setExpenseFormOpen(true)}
                  className="flex-1 justify-start gap-2 rounded-r-none border-r border-amber-700/30 bg-amber-500 text-white shadow-sm hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
                >
                  <Plus className="h-4 w-4" />
                  <span className="font-medium">New expense</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="rounded-l-none px-2 bg-amber-500 text-white shadow-sm hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
                      aria-label="More expense options"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" sideOffset={6} className="w-56">
                    <DropdownMenuItem onClick={() => setExpenseFormOpen(true)}>
                      <Plus className="h-4 w-4" />
                      New expense
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setRecurringFormOpen(true)}>
                      <Repeat className="h-4 w-4" />
                      New recurring expense
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={() => setExpenseFormOpen(true)}
                size="icon"
                className="h-10 w-10 mx-auto bg-amber-500 text-white shadow-sm hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
                aria-label="New expense"
                title="New expense"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Month Selector — Global Context */}
          {!sidebarCollapsed && (
            <div className="px-3 pb-4">
              <MonthSelector
                selectedMonth={selectedMonth}
                onMonthChange={onMonthChange}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <SidebarNav collapsed={sidebarCollapsed} month={selectedMonth} />
          </div>

          {/* Footer — Settings, ThemeToggle, UserButton */}
          <div className={cn(
            "border-t border-stone-200 dark:border-stone-800",
            sidebarCollapsed ? "p-2 flex flex-col items-center gap-2" : "px-3 py-3 space-y-2"
          )}>
            {/* Settings link */}
            <Link
              href="/settings"
              aria-current={settingsActive ? "page" : undefined}
              title={sidebarCollapsed ? "Settings" : undefined}
              className={cn(
                "group flex items-center rounded-md text-sm font-medium transition-colors",
                settingsActive
                  ? "border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                  : "border-l-2 border-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100",
                sidebarCollapsed ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2"
              )}
            >
              <SettingsIcon className={cn("h-4 w-4 flex-shrink-0", settingsActive && "text-amber-700 dark:text-amber-400")} />
              {!sidebarCollapsed && <span className="flex-1 truncate">Settings</span>}
            </Link>

            {/* Theme toggle + user button row */}
            <div className={cn(
              "flex items-center",
              sidebarCollapsed ? "flex-col gap-2" : "justify-between gap-2 px-2"
            )}>
              {mounted && <ThemeToggle />}
              {mounted && (
                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      avatarBox: sidebarCollapsed ? "w-8 h-8" : "w-9 h-9",
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="fixed left-0 top-0 h-screen w-64 bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Logo Section */}
              <div className="px-5 py-5 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                  <BreadyLogo size={28} />
                  <h1 className="font-display text-lg font-semibold text-stone-900 dark:text-stone-100">
                    Bready
                  </h1>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden h-7 w-7 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto px-3 pb-4">
                <SidebarNav month={selectedMonth} />
              </div>

              {/* Footer — Settings + Month + UserButton */}
              <div className="border-t border-stone-200 dark:border-stone-800 px-3 py-3 space-y-2">
                <Link
                  href="/settings"
                  onClick={() => setSidebarOpen(false)}
                  aria-current={settingsActive ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    settingsActive
                      ? "border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
                      : "border-l-2 border-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                  )}
                >
                  <SettingsIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 truncate">Settings</span>
                </Link>
                <div className="flex items-center justify-between gap-2 px-2 pt-1">
                  {mounted && <ThemeToggle />}
                  {mounted && (
                    <UserButton
                      afterSignOutUrl="/sign-in"
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9",
                        },
                      }}
                    />
                  )}
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
        <header className="sticky top-0 z-30 bg-card/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 px-4 py-3 md:hidden">
          <div className="flex items-center justify-between mb-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <BreadyLogo size={24} />
              <h1 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
                Bready
              </h1>
            </Link>
            <div className="flex items-center gap-2">
              {mounted && <ThemeToggle />}
              {mounted && (
                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Mobile Month Selector */}
          <MobileMonthBar
            selectedMonth={selectedMonth}
            onMonthChange={onMonthChange}
          />
        </header>

        {/* Page Content */}
        <main
          id="main-content"
          className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 md:px-8 pb-20 md:pb-8"
        >
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav month={selectedMonth} />

      {/* Mobile FAB — single primary action with split menu */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
              aria-label="Add expense"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" sideOffset={8} className="w-56">
            <DropdownMenuItem onClick={() => setExpenseFormOpen(true)}>
              <Plus className="h-4 w-4" />
              New expense
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setRecurringFormOpen(true)}>
              <Repeat className="h-4 w-4" />
              New recurring expense
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
                toast.error(error.error || 'Failed to add expense. Please try again.')
              }
            } catch (error) {
              console.error('Failed to add expense:', error)
              toast.error('Failed to add expense. Please try again.')
            }
          }}
          open={expenseFormOpen}
          onOpenChange={setExpenseFormOpen}
        />
      )}

      {/* Recurring Expense Form Dialog */}
      <RecurringExpenseForm
        users={users}
        open={recurringFormOpen}
        onOpenChange={setRecurringFormOpen}
      />

      {/* Keyboard Shortcuts Navigation (? key to Settings) */}
      <KeyboardShortcutsNavigation />
    </div>
  )
}
