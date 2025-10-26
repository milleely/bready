/**
 * Net Worth Calculation Utilities
 *
 * Functions for calculating net worth, normalizing income frequencies,
 * and generating budget allocations (50/30/20 rule).
 */

import type {
  Asset,
  Liability,
  IncomeSource,
  NetWorthSummary,
  BudgetAllocation,
  PaycheckAllocation,
  AssetsByCategory,
  LiabilitiesByCategory,
} from "@/lib/types/networth"
import { getAssetCategoryLabel, getLiabilityCategoryLabel } from "./categories"

/**
 * Normalize income to monthly amount based on frequency
 */
export function normalizeIncomeToMonthly(amount: number, frequency: string): number {
  switch (frequency) {
    case "biweekly":
      // 26 paychecks per year ÷ 12 months = 2.167 paychecks per month
      return amount * 2.167
    case "monthly":
      return amount
    case "annual":
      return amount / 12
    default:
      return amount
  }
}

/**
 * Calculate total monthly income from all income sources
 */
export function calculateMonthlyIncome(incomeSources: IncomeSource[]): number {
  return incomeSources.reduce((total, source) => {
    return total + normalizeIncomeToMonthly(source.amount, source.frequency)
  }, 0)
}

/**
 * Calculate total assets
 */
export function calculateTotalAssets(assets: Asset[]): number {
  return assets.reduce((total, asset) => total + asset.value, 0)
}

/**
 * Calculate total liabilities
 */
export function calculateTotalLiabilities(liabilities: Liability[]): number {
  return liabilities.reduce((total, liability) => total + liability.balance, 0)
}

/**
 * Calculate net worth (assets - liabilities)
 */
export function calculateNetWorth(assets: Asset[], liabilities: Liability[]): number {
  return calculateTotalAssets(assets) - calculateTotalLiabilities(liabilities)
}

/**
 * Calculate monthly savings rate
 * Formula: (monthlyIncome - monthlyExpenses) / monthlyIncome
 */
export function calculateSavingsRate(monthlyIncome: number, monthlyExpenses: number): number {
  if (monthlyIncome === 0) return 0
  return ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100
}

/**
 * Generate complete net worth summary
 */
export function generateNetWorthSummary(
  userId: string,
  incomeSources: IncomeSource[],
  assets: Asset[],
  liabilities: Liability[],
  monthlyExpenses: number
): NetWorthSummary {
  const monthlyIncome = calculateMonthlyIncome(incomeSources)
  const totalAssets = calculateTotalAssets(assets)
  const totalLiabilities = calculateTotalLiabilities(liabilities)

  return {
    userId,
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    monthlyIncome,
    monthlyExpenses,
    monthlySavingsRate: calculateSavingsRate(monthlyIncome, monthlyExpenses),
  }
}

/**
 * Group assets by category
 */
export function groupAssetsByCategory(assets: Asset[]): AssetsByCategory[] {
  const grouped = new Map<string, Asset[]>()

  // Group assets
  assets.forEach((asset) => {
    const existing = grouped.get(asset.category) ?? []
    grouped.set(asset.category, [...existing, asset])
  })

  // Convert to array with totals
  return Array.from(grouped.entries()).map(([category, items]) => ({
    category: category as any,
    categoryLabel: getAssetCategoryLabel(category as any),
    items,
    total: items.reduce((sum, item) => sum + item.value, 0),
  }))
}

/**
 * Group liabilities by category
 */
export function groupLiabilitiesByCategory(liabilities: Liability[]): LiabilitiesByCategory[] {
  const grouped = new Map<string, Liability[]>()

  // Group liabilities
  liabilities.forEach((liability) => {
    const existing = grouped.get(liability.category) ?? []
    grouped.set(liability.category, [...existing, liability])
  })

  // Convert to array with totals
  return Array.from(grouped.entries()).map(([category, items]) => ({
    category: category as any,
    categoryLabel: getLiabilityCategoryLabel(category as any),
    items,
    total: items.reduce((sum, item) => sum + item.balance, 0),
  }))
}

/**
 * Generate 50/30/20 budget allocation
 * Can be customized with different percentages
 */
export function generateBudgetAllocation(
  monthlyIncome: number,
  customPercentages?: {
    needs: number
    wants: number
    savings: number
  }
): BudgetAllocation {
  const percentages = customPercentages ?? {
    needs: 50,
    wants: 30,
    savings: 20,
  }

  return {
    totalMonthlyIncome: monthlyIncome,
    needs: {
      percentage: percentages.needs,
      amount: (monthlyIncome * percentages.needs) / 100,
      label: "Needs (Housing, Utilities, Food)",
    },
    wants: {
      percentage: percentages.wants,
      amount: (monthlyIncome * percentages.wants) / 100,
      label: "Wants (Entertainment, Dining Out)",
    },
    savings: {
      percentage: percentages.savings,
      amount: (monthlyIncome * percentages.savings) / 100,
      label: "Savings",
    },
  }
}

/**
 * Generate bi-weekly paycheck allocation
 * Divides monthly allocation by 2.167 (26 paychecks ÷ 12 months)
 */
export function generatePaycheckAllocation(
  monthlyIncome: number,
  customPercentages?: {
    needs: number
    wants: number
    savings: number
  }
): PaycheckAllocation {
  const biweeklyIncome = monthlyIncome / 2.167
  const budgetAllocation = generateBudgetAllocation(monthlyIncome, customPercentages)

  return {
    frequency: "biweekly",
    grossAmount: biweeklyIncome,
    needs: budgetAllocation.needs.amount / 2.167,
    wants: budgetAllocation.wants.amount / 2.167,
    savings: budgetAllocation.savings.amount / 2.167,
    customPercentages,
  }
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}
