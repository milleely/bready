"use client"

/**
 * Net Worth Page Content Component
 *
 * Main orchestrator for the Net Worth dashboard.
 * Handles authentication, data fetching, and CRUD operations.
 */

import { useState, useEffect } from "react"
import { User } from "@prisma/client"
import { UserSelector } from "@/components/networth/user-selector"
import { PinEntryDialog } from "@/components/networth/pin-entry-dialog"
import { PinSetupDialog } from "@/components/networth/pin-setup-dialog"
import { NetWorthHero } from "@/components/networth/net-worth-hero"
import { IncomeSection } from "@/components/networth/income-section"
import { AssetsSection } from "@/components/networth/assets-section"
import { LiabilitiesSection } from "@/components/networth/liabilities-section"
import { ExpenseOverrideDialog } from "@/components/networth/expense-override-dialog"
import { BudgetAllocationCard } from "@/components/networth/budget-allocation-card"
import { MonthlyProgressTracker } from "@/components/networth/monthly-progress-tracker"
import { IncomeFormDialog } from "@/components/networth/income-form-dialog"
import { AssetFormDialog } from "@/components/networth/asset-form-dialog"
import { LiabilityFormDialog } from "@/components/networth/liability-form-dialog"
import { Loader2, Copy } from "lucide-react"
import { toast } from "sonner"
import { createSessionAction, logoutAction } from "@/app/actions/networth-session"
import type {
  NetWorthDashboardData,
  IncomeSource,
  Asset,
  Liability,
  IncomeFrequency,
  AssetCategory,
  LiabilityCategory,
} from "@/lib/types/networth"

interface NetWorthPageContentProps {
  initialUsers: User[]
  authenticated: boolean
  userId: string | null
  householdId?: string // Optional householdId for performance optimization
  month?: string // Optional month parameter (format: YYYY-MM)
}

export function NetWorthPageContent({ initialUsers, authenticated: initialAuth, userId: initialUserId, householdId, month }: NetWorthPageContentProps) {
  // Authentication state (initialized from server-side props)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(initialUserId)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [showPinSetupDialog, setShowPinSetupDialog] = useState(false)
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(initialUserId)

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<NetWorthDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form dialog state
  const [incomeDialog, setIncomeDialog] = useState<{
    open: boolean
    income: IncomeSource | null
  }>({ open: false, income: null })
  const [assetDialog, setAssetDialog] = useState<{ open: boolean; asset: Asset | null }>({
    open: false,
    asset: null,
  })
  const [liabilityDialog, setLiabilityDialog] = useState<{
    open: boolean
    liability: Liability | null
  }>({ open: false, liability: null })
  const [expenseOverrideDialog, setExpenseOverrideDialog] = useState(false)

  const selectedUser = initialUsers.find((u) => u.id === selectedUserId)

  // No need to check session on mount - authentication state comes from server props
  // The Server Component wrapper (app/(new-layout)/networth/page.tsx) handles session checks

  // Fetch dashboard data when user is authenticated or month changes
  useEffect(() => {
    if (authenticatedUserId) {
      fetchDashboardData(authenticatedUserId)
    } else {
      setDashboardData(null)
    }
  }, [authenticatedUserId, month])

  // Listen for expense changes from other pages
  useEffect(() => {
    if (!authenticatedUserId) return // Only listen when authenticated

    const handleExpenseChange = () => {
      fetchDashboardData(authenticatedUserId)
    }

    window.addEventListener('expenseAdded', handleExpenseChange)
    window.addEventListener('expenseEdited', handleExpenseChange)
    window.addEventListener('expenseDeleted', handleExpenseChange)

    return () => {
      window.removeEventListener('expenseAdded', handleExpenseChange)
      window.removeEventListener('expenseEdited', handleExpenseChange)
      window.removeEventListener('expenseDeleted', handleExpenseChange)
    }
  }, [authenticatedUserId, month])

  // Inactivity timeout: Auto-logout after 30 minutes of inactivity (matches server-side timeout)
  useEffect(() => {
    if (!authenticatedUserId) return // Only run when authenticated

    const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes
    const WARNING_TIME = 29 * 60 * 1000 // 29 minutes (1 min before logout)

    let inactivityTimer: NodeJS.Timeout
    let warningTimer: NodeJS.Timeout

    const resetTimers = () => {
      // Clear existing timers
      clearTimeout(inactivityTimer)
      clearTimeout(warningTimer)

      // Set warning timer (29 minutes)
      warningTimer = setTimeout(() => {
        toast.warning("⏱️ Session expiring in 1 minute due to inactivity...", {
          duration: 60000, // Show for 1 minute
        })
      }, WARNING_TIME)

      // Set logout timer (30 minutes)
      inactivityTimer = setTimeout(() => {
        toast.error("Session expired due to inactivity")
        handleLogout()
      }, INACTIVITY_TIMEOUT)
    }

    // Activity events to monitor
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']

    // Attach listeners with passive flag for performance
    events.forEach(event => window.addEventListener(event, resetTimers, { passive: true }))

    // Initialize timers
    resetTimers()

    // Cleanup on unmount or when authentication changes
    return () => {
      clearTimeout(inactivityTimer)
      clearTimeout(warningTimer)
      events.forEach(event => window.removeEventListener(event, resetTimers))
    }
  }, [authenticatedUserId])

  const fetchDashboardData = async (userId: string) => {
    setIsLoading(true)
    try {
      // 🚀 PERFORMANCE: Build URL with userId, householdId (skips duplicate lookup), and optional month
      const params = new URLSearchParams({ userId })
      if (householdId) params.set('householdId', householdId)
      if (month) params.set('month', month)

      const response = await fetch(`/api/networth/summary?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch data")
      const data: NetWorthDashboardData = await response.json()
      setDashboardData(data)
    } catch (error) {
      toast.error("Failed to load net worth data")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserSelect = async (userId: string) => {
    setSelectedUserId(userId)

    // Check if user has a PIN set up
    try {
      const response = await fetch(`/api/networth/pin/setup?userId=${userId}`)
      const data = await response.json()

      if (data.hasPin) {
        setShowPinDialog(true)
      } else {
        setShowPinSetupDialog(true)
      }
    } catch (error) {
      console.error("Error checking PIN status:", error)
      toast.error("Failed to check PIN status")
    }
  }

  const handlePinVerify = async (pin: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/networth/pin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, pin }),
      })

      const data = await response.json()
      if (data.success) {
        // Use server action to create session (httpOnly cookie)
        const sessionResult = await createSessionAction(selectedUserId!)
        if (sessionResult.success) {
          setAuthenticatedUserId(selectedUserId)
          return true
        }
      }
      return false
    } catch (error) {
      console.error("PIN verification error:", error)
      return false
    }
  }

  const handlePinSetup = async (pin: string): Promise<boolean> => {
    try {
      const response = await fetch("/api/networth/pin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, pin }),
      })

      const data = await response.json()
      if (data.success) {
        // After successful setup, authenticate the user immediately
        // Use server action to create session (httpOnly cookie)
        const sessionResult = await createSessionAction(selectedUserId!)
        if (sessionResult.success) {
          setAuthenticatedUserId(selectedUserId)
          return true
        }
      }
      return false
    } catch (error) {
      console.error("PIN setup error:", error)
      return false
    }
  }

  const handleLogout = async () => {
    // Use server action to clear session (httpOnly cookie)
    await logoutAction()
    setAuthenticatedUserId(null)
    setSelectedUserId(null)
    setDashboardData(null)
  }

  // ============= CRUD Handlers =============

  // Helper: Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  }

  // Helper: Copy all records from source month to target month
  const carryForwardData = async (
    sourceMonth: string,
    targetMonth: string,
    dataTypes: ("assets" | "liabilities" | "income")[]
  ) => {
    const response = await fetch("/api/networth/carry-forward", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authenticatedUserId,
        sourceMonth,
        targetMonth,
        dataTypes,
      }),
    })
    if (!response.ok) {
      console.error("Failed to carry forward data")
    }
    return response.json()
  }

  // Income CRUD
  const handleAddIncome = () => setIncomeDialog({ open: true, income: null })
  const handleEditIncome = (income: IncomeSource) => setIncomeDialog({ open: true, income })
  const handleSaveIncome = async (data: {
    name: string
    amount: number
    frequency: IncomeFrequency
  }) => {
    const currentMonth = month || getCurrentMonth()
    const isEditing = incomeDialog.income !== null
    // Check if editing inherited data (record from a different month)
    const isEditingInherited = isEditing && incomeDialog.income!.month !== currentMonth

    // If editing inherited data, copy ALL income records first, then update the specific one
    if (isEditingInherited) {
      await carryForwardData(incomeDialog.income!.month, currentMonth, ["income"])
    }

    // If editing inherited data, create new record for current month (POST)
    // Otherwise, update existing record (PUT) or create new (POST)
    const url = isEditing && !isEditingInherited
      ? `/api/networth/income/${incomeDialog.income!.id}`
      : "/api/networth/income"
    const method = isEditing && !isEditingInherited ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authenticatedUserId,
        month: currentMonth,
        ...data,
      }),
    })

    if (!response.ok) throw new Error("Failed to save income source")
    await fetchDashboardData(authenticatedUserId!)
  }

  const handleDeleteIncome = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income source?")) return

    const response = await fetch(`/api/networth/income/${id}`, { method: "DELETE" })
    if (!response.ok) throw new Error("Failed to delete income source")

    toast.success("Income source deleted")
    await fetchDashboardData(authenticatedUserId!)
  }

  // Asset CRUD
  const handleAddAsset = () => setAssetDialog({ open: true, asset: null })
  const handleEditAsset = (asset: Asset) => setAssetDialog({ open: true, asset })
  const handleSaveAsset = async (data: {
    category: AssetCategory
    name: string
    value: number
    notes?: string
  }) => {
    const currentMonth = month || getCurrentMonth()
    const isEditing = assetDialog.asset !== null
    // Check if editing inherited data (record from a different month)
    const isEditingInherited = isEditing && assetDialog.asset!.month !== currentMonth

    // If editing inherited data, copy ALL asset records first, then update the specific one
    if (isEditingInherited) {
      await carryForwardData(assetDialog.asset!.month, currentMonth, ["assets"])
    }

    // If editing inherited data, create new record for current month (POST)
    // Otherwise, update existing record (PUT) or create new (POST)
    const url = isEditing && !isEditingInherited
      ? `/api/networth/assets/${assetDialog.asset!.id}`
      : "/api/networth/assets"
    const method = isEditing && !isEditingInherited ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authenticatedUserId,
        month: currentMonth,
        ...data,
      }),
    })

    if (!response.ok) throw new Error("Failed to save asset")
    await fetchDashboardData(authenticatedUserId!)
  }

  const handleDeleteAsset = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return

    const response = await fetch(`/api/networth/assets/${id}`, { method: "DELETE" })
    if (!response.ok) throw new Error("Failed to delete asset")

    toast.success("Asset deleted")
    await fetchDashboardData(authenticatedUserId!)
  }

  // Liability CRUD
  const handleAddLiability = () => setLiabilityDialog({ open: true, liability: null })
  const handleEditLiability = (liability: Liability) =>
    setLiabilityDialog({ open: true, liability })
  const handleSaveLiability = async (data: {
    category: LiabilityCategory
    name: string
    balance: number
    interestRate?: number
    minimumPayment?: number
    notes?: string
  }) => {
    const currentMonth = month || getCurrentMonth()
    const isEditing = liabilityDialog.liability !== null
    // Check if editing inherited data (record from a different month)
    const isEditingInherited = isEditing && liabilityDialog.liability!.month !== currentMonth

    // If editing inherited data, copy ALL liability records first, then update the specific one
    if (isEditingInherited) {
      await carryForwardData(liabilityDialog.liability!.month, currentMonth, ["liabilities"])
    }

    // If editing inherited data, create new record for current month (POST)
    // Otherwise, update existing record (PUT) or create new (POST)
    const url = isEditing && !isEditingInherited
      ? `/api/networth/liabilities/${liabilityDialog.liability!.id}`
      : "/api/networth/liabilities"
    const method = isEditing && !isEditingInherited ? "PUT" : "POST"

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authenticatedUserId,
        month: currentMonth,
        ...data,
      }),
    })

    if (!response.ok) throw new Error("Failed to save liability")
    await fetchDashboardData(authenticatedUserId!)
  }

  const handleDeleteLiability = async (id: string) => {
    if (!confirm("Are you sure you want to delete this liability?")) return

    const response = await fetch(`/api/networth/liabilities/${id}`, { method: "DELETE" })
    if (!response.ok) throw new Error("Failed to delete liability")

    toast.success("Liability deleted")
    await fetchDashboardData(authenticatedUserId!)
  }

  // Expense Override
  const handleUpdateExpenseOverride = async (data: { amount: number; useOverride: boolean }) => {
    const response = await fetch("/api/networth/expense-override", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: authenticatedUserId, ...data }),
    })

    if (!response.ok) throw new Error("Failed to update expense override")
    await fetchDashboardData(authenticatedUserId!)
  }

  // Copy to Next Month - Helper to calculate next month
  const getNextMonth = (currentMonth: string) => {
    const [year, monthNum] = currentMonth.split("-").map(Number)
    const nextMonthNum = monthNum === 12 ? 1 : monthNum + 1
    const nextYear = monthNum === 12 ? year + 1 : year
    return `${nextYear}-${String(nextMonthNum).padStart(2, "0")}`
  }

  // Format month for display (e.g., "2025-12" -> "December 2025")
  const formatMonthDisplay = (monthStr: string) => {
    const [year, monthNum] = monthStr.split("-").map(Number)
    const date = new Date(year, monthNum - 1)
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  // Handle Copy to Next Month
  const handleCopyToNextMonth = async () => {
    const currentMonth = month || getCurrentMonth()
    const nextMonth = getNextMonth(currentMonth)

    const confirmed = confirm(
      `Copy all current Net Worth data to ${formatMonthDisplay(nextMonth)}?\n\n` +
      `This will copy:\n` +
      `• All income sources\n` +
      `• All assets\n` +
      `• All liabilities\n\n` +
      `Existing data in ${formatMonthDisplay(nextMonth)} will not be overwritten.`
    )

    if (!confirmed) return

    try {
      const result = await carryForwardData(currentMonth, nextMonth, ["assets", "liabilities", "income"])

      if (result.totalCopied > 0) {
        toast.success(
          `Copied to ${formatMonthDisplay(nextMonth)}: ` +
          `${result.copiedCounts.income} income, ` +
          `${result.copiedCounts.assets} assets, ` +
          `${result.copiedCounts.liabilities} liabilities`
        )
      } else {
        toast.info(`All data already exists in ${formatMonthDisplay(nextMonth)}`)
      }
    } catch (error) {
      console.error("Failed to copy data:", error)
      toast.error("Failed to copy data to next month")
    }
  }

  // ============= Render =============

  // Not authenticated - show user selector
  if (!authenticatedUserId || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-stone-900">Net Worth Dashboard</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
          </div>
        ) : (
          <>
            <UserSelector
              users={initialUsers}
              selectedUserId={selectedUserId}
              onSelectUser={handleUserSelect}
            />

            <PinEntryDialog
              open={showPinDialog}
              onOpenChange={setShowPinDialog}
              userName={selectedUser?.name ?? ""}
              onVerify={handlePinVerify}
            />

            <PinSetupDialog
              open={showPinSetupDialog}
              onOpenChange={setShowPinSetupDialog}
              userName={selectedUser?.name ?? ""}
              onSetup={handlePinSetup}
            />
          </>
        )}
      </div>
    )
  }

  // Authenticated - show dashboard
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">
            {dashboardData.user.name.trim()}'s Net Worth
          </h1>
          <p className="hidden md:block text-sm text-stone-600 mt-1">Track your financial health in one place</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyToNextMonth}
            className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            title="Copy all data to next month"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden md:inline">Copy to Next Month</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Switch User
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        </div>
      ) : (
        <>
          {/* Net Worth Summary */}
          <NetWorthHero
            summary={dashboardData.summary}
            onEditExpenses={() => setExpenseOverrideDialog(true)}
          />

          {/* Income Section */}
          <IncomeSection
            incomeSources={dashboardData.incomeSources}
            onAdd={handleAddIncome}
            onEdit={handleEditIncome}
            onDelete={handleDeleteIncome}
          />

          {/* Two Column Layout: Assets & Liabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AssetsSection
              assetsByCategory={dashboardData.assetsByCategory}
              totalAssets={dashboardData.summary.totalAssets}
              onAdd={handleAddAsset}
              onEdit={handleEditAsset}
              onDelete={handleDeleteAsset}
            />

            <LiabilitiesSection
              liabilitiesByCategory={dashboardData.liabilitiesByCategory}
              totalLiabilities={dashboardData.summary.totalLiabilities}
              onAdd={handleAddLiability}
              onEdit={handleEditLiability}
              onDelete={handleDeleteLiability}
            />
          </div>

          {/* Budget & Paycheck Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetAllocationCard budgetAllocation={dashboardData.budgetAllocation} />
            {dashboardData.paycheckAllocation && (
              <MonthlyProgressTracker
                paycheckAllocation={dashboardData.paycheckAllocation}
                actualSpending={dashboardData.actualSpending}
                month={month}
              />
            )}
          </div>
        </>
      )}

      {/* Form Dialogs */}
      <IncomeFormDialog
        open={incomeDialog.open}
        onOpenChange={(open) => setIncomeDialog({ open, income: null })}
        incomeSource={incomeDialog.income}
        onSave={handleSaveIncome}
      />

      <AssetFormDialog
        open={assetDialog.open}
        onOpenChange={(open) => setAssetDialog({ open, asset: null })}
        asset={assetDialog.asset}
        onSave={handleSaveAsset}
      />

      <LiabilityFormDialog
        open={liabilityDialog.open}
        onOpenChange={(open) => setLiabilityDialog({ open, liability: null })}
        liability={liabilityDialog.liability}
        onSave={handleSaveLiability}
      />

      <ExpenseOverrideDialog
        open={expenseOverrideDialog}
        onOpenChange={setExpenseOverrideDialog}
        monthlyExpenses={dashboardData.summary.monthlyExpenses}
        expenseOverride={dashboardData.expenseOverride}
        onUpdateOverride={handleUpdateExpenseOverride}
      />
    </div>
  )
}
