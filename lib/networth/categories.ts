/**
 * Net Worth Category Definitions
 *
 * Predefined categories for assets and liabilities with display labels.
 * Users can also select "other" to enter custom items.
 */

import type { AssetCategory, LiabilityCategory, IncomeFrequency } from "@/lib/types/networth"

/**
 * Asset category configuration
 */
export const ASSET_CATEGORIES: Array<{
  value: AssetCategory
  label: string
  description: string
  examples: string[]
}> = [
  {
    value: "cash",
    label: "Cash & Bank Accounts",
    description: "Checking, savings, cash on hand",
    examples: ["Chase Checking", "Ally Savings", "Emergency Fund"],
  },
  {
    value: "investments",
    label: "Investments & Retirement",
    description: "401(k), IRA, brokerage, stocks, bonds",
    examples: ["401(k)", "Roth IRA", "Vanguard Index Funds", "Individual Stocks"],
  },
  {
    value: "property",
    label: "Real Estate & Property",
    description: "Primary home, rental properties, land",
    examples: ["Primary Home", "Rental Property", "Vacation Home", "Land"],
  },
  {
    value: "vehicles",
    label: "Vehicles",
    description: "Cars, motorcycles, boats, RVs",
    examples: ["2020 Honda Civic", "Motorcycle", "Boat"],
  },
  {
    value: "other",
    label: "Other Assets",
    description: "Collectibles, jewelry, business equity",
    examples: ["Jewelry", "Art Collection", "Business Ownership"],
  },
]

/**
 * Liability category configuration
 */
export const LIABILITY_CATEGORIES: Array<{
  value: LiabilityCategory
  label: string
  description: string
  examples: string[]
}> = [
  {
    value: "credit_card",
    label: "Credit Card Debt",
    description: "Outstanding credit card balances",
    examples: ["Chase Freedom", "American Express", "Discover"],
  },
  {
    value: "student_loan",
    label: "Student Loans",
    description: "Federal and private student loans",
    examples: ["Navient Student Loan", "Federal Direct Loan"],
  },
  {
    value: "mortgage",
    label: "Mortgage",
    description: "Home loans and home equity loans",
    examples: ["Primary Home Mortgage", "Home Equity Line of Credit"],
  },
  {
    value: "auto_loan",
    label: "Auto Loans",
    description: "Vehicle financing",
    examples: ["Car Loan", "Motorcycle Loan"],
  },
  {
    value: "personal_loan",
    label: "Personal Loans",
    description: "Unsecured personal loans",
    examples: ["Personal Loan", "Peer-to-Peer Loan"],
  },
  {
    value: "other",
    label: "Other Debt",
    description: "Medical bills, tax debt, other liabilities",
    examples: ["Medical Bill Payment Plan", "IRS Tax Debt"],
  },
]

/**
 * Income frequency configuration
 */
export const INCOME_FREQUENCIES: Array<{
  value: IncomeFrequency
  label: string
  description: string
}> = [
  {
    value: "biweekly",
    label: "Bi-weekly (Every 2 weeks)",
    description: "26 paychecks per year",
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "12 paychecks per year",
  },
  {
    value: "annual",
    label: "Annual",
    description: "Once per year (bonus, tax refund, etc.)",
  },
  {
    value: "one_time",
    label: "One-time",
    description: "Single occurrence (gift, bonus, windfall)",
  },
]

/**
 * Helper function to get asset category label
 */
export function getAssetCategoryLabel(category: AssetCategory): string {
  return ASSET_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

/**
 * Helper function to get liability category label
 */
export function getLiabilityCategoryLabel(category: LiabilityCategory): string {
  return LIABILITY_CATEGORIES.find((c) => c.value === category)?.label ?? category
}

/**
 * Helper function to get income frequency label
 */
export function getIncomeFrequencyLabel(frequency: IncomeFrequency): string {
  return INCOME_FREQUENCIES.find((f) => f.value === frequency)?.label ?? frequency
}
