/**
 * Net Worth Tracking Type Definitions
 *
 * Defines the structure for personal finance tracking including
 * income sources, assets, liabilities, and net worth calculations.
 */

/**
 * Income frequency types
 */
export type IncomeFrequency = "biweekly" | "monthly" | "annual"

/**
 * Asset category types
 */
export type AssetCategory =
  | "cash"          // Checking, savings, cash on hand
  | "investments"   // 401(k), IRA, brokerage, stocks
  | "property"      // Real estate, land
  | "vehicles"      // Cars, motorcycles, boats
  | "other"         // Custom assets

/**
 * Liability category types
 */
export type LiabilityCategory =
  | "credit_card"
  | "student_loan"
  | "mortgage"
  | "auto_loan"
  | "personal_loan"
  | "other"

/**
 * Income source interface (matches Prisma IncomeSource model)
 */
export interface IncomeSource {
  id: string
  userId: string
  name: string              // "Primary Salary", "Freelance", etc.
  amount: number            // Amount per period
  frequency: IncomeFrequency
  createdAt: Date
  updatedAt: Date
}

/**
 * Asset interface (matches Prisma Asset model)
 */
export interface Asset {
  id: string
  userId: string
  category: AssetCategory
  name: string              // "Chase Checking", "401(k)", etc.
  value: number             // Current value
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Liability interface (matches Prisma Liability model)
 */
export interface Liability {
  id: string
  userId: string
  category: LiabilityCategory
  name: string              // "Chase Freedom", "Student Loan", etc.
  balance: number           // Current balance owed
  interestRate?: number | null     // APR (optional)
  minimumPayment?: number | null   // Monthly minimum (optional)
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Monthly expense override interface (matches Prisma MonthlyExpenseOverride model)
 */
export interface MonthlyExpenseOverride {
  id: string
  userId: string
  amount: number            // Manual override amount
  useOverride: boolean      // Whether to use override instead of auto-calc
  updatedAt: Date
}

/**
 * Net worth summary calculation
 */
export interface NetWorthSummary {
  userId: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number          // totalAssets - totalLiabilities
  monthlyIncome: number     // All income normalized to monthly amount
  monthlyExpenses: number   // Either auto-calculated or manual override
  monthlySavingsRate: number // (monthlyIncome - monthlyExpenses) / monthlyIncome
}

/**
 * Grouped assets by category
 */
export interface AssetsByCategory {
  category: AssetCategory
  categoryLabel: string     // Display name
  items: Asset[]
  total: number             // Sum of all asset values in category
}

/**
 * Grouped liabilities by category
 */
export interface LiabilitiesByCategory {
  category: LiabilityCategory
  categoryLabel: string     // Display name
  items: Liability[]
  total: number             // Sum of all liability balances in category
}

/**
 * 50/30/20 budget allocation breakdown
 * (Can be customized to different percentages)
 */
export interface BudgetAllocation {
  totalMonthlyIncome: number
  needs: {
    percentage: number      // Default: 50
    amount: number          // Calculated from income
    label: string           // "Needs (Housing, Utilities, Food)"
  }
  wants: {
    percentage: number      // Default: 30
    amount: number          // Calculated from income
    label: string           // "Wants (Entertainment, Dining Out)"
  }
  savings: {
    percentage: number      // Default: 20
    amount: number          // Calculated from income
    label: string           // "Savings & Debt Payments"
  }
}

/**
 * Paycheck allocation recommendation (bi-weekly breakdown)
 */
export interface PaycheckAllocation {
  frequency: "biweekly"     // Currently only supporting bi-weekly
  grossAmount: number       // Total bi-weekly income
  needs: number             // 50% by default
  wants: number             // 30% by default
  savings: number           // 20% by default
  customPercentages?: {
    needs: number
    wants: number
    savings: number
  }
}

/**
 * Actual spending breakdown by budget category
 */
export interface ActualSpending {
  needsSpent: number
  wantsSpent: number
  savingsSpent: number  // Future: track actual savings/debt payments
  total: number
}

/**
 * Complete net worth dashboard data
 */
export interface NetWorthDashboardData {
  user: {
    id: string
    name: string
  }
  summary: NetWorthSummary
  incomeSources: IncomeSource[]
  assetsByCategory: AssetsByCategory[]
  liabilitiesByCategory: LiabilitiesByCategory[]
  budgetAllocation: BudgetAllocation
  paycheckAllocation?: PaycheckAllocation
  expenseOverride?: MonthlyExpenseOverride
  actualSpending?: ActualSpending
}

/**
 * Form input types for creating/editing entries
 */
export interface IncomeSourceInput {
  name: string
  amount: number
  frequency: IncomeFrequency
}

export interface AssetInput {
  category: AssetCategory
  name: string
  value: number
  notes?: string
}

export interface LiabilityInput {
  category: LiabilityCategory
  name: string
  balance: number
  interestRate?: number
  minimumPayment?: number
  notes?: string
}

export interface ExpenseOverrideInput {
  amount: number
  useOverride: boolean
}
