"use client"

import { useState } from "react"
import { UserButton } from "@clerk/nextjs"
import { SidebarNav } from "@/components/sidebar/sidebar-nav"
import { MobileNav } from "@/components/mobile-nav/mobile-nav"
import { BreadyLogo } from "@/components/bready-logo"
import { ExpenseForm } from "@/components/expense-form"
import { MonthSelector } from "@/components/month-selector"
import { Menu, X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SidebarLayoutProps {
  children: React.ReactNode
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expenseFormOpen, setExpenseFormOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-white border-r border-gray-200 shadow-sm hidden md:block">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <BreadyLogo size={40} />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
                  Bready
                </h1>
                <p className="text-xs text-muted-foreground">Track your dough</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <SidebarNav />
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            <MonthSelector
              selectedMonth={new Date().toISOString().slice(0, 7)}
              onMonthChange={() => {}}
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
                  selectedMonth={new Date().toISOString().slice(0, 7)}
                  onMonthChange={() => {}}
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
      <div className="md:ml-64">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 md:hidden">
          <div className="flex items-center justify-between">
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
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Floating Action Button - Add Expense */}
      <Button
        size="lg"
        onClick={() => setExpenseFormOpen(true)}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 md:bottom-6 md:right-6"
      >
        <Plus className="h-6 w-6" />
      </Button>

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
