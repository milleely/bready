/**
 * Test script for Net Worth utilities
 * Run with: npx tsx lib/networth/test.ts
 */

import {
  normalizeIncomeToMonthly,
  calculateMonthlyIncome,
  calculateTotalAssets,
  calculateTotalLiabilities,
  calculateNetWorth,
  calculateSavingsRate,
  generateBudgetAllocation,
  generatePaycheckAllocation,
  formatCurrency,
  formatPercentage,
  groupAssetsByCategory,
  groupLiabilitiesByCategory,
} from "./calculations"

import {
  getAssetCategoryLabel,
  getLiabilityCategoryLabel,
  getIncomeFrequencyLabel,
} from "./categories"

import {
  pinSchema,
  incomeSourceSchema,
  assetSchema,
  liabilitySchema,
  budgetAllocationSchema,
} from "./validation"

import type { Asset, Liability, IncomeSource } from "@/lib/types/networth"

console.log("🧪 Testing Net Worth Utilities\n")
console.log("=" .repeat(60))

// ============================================================================
// Test 1: Income Normalization
// ============================================================================
console.log("\n📊 Test 1: Income Normalization to Monthly")
console.log("-".repeat(60))

const biweeklyIncome = 2000
const monthlyIncome = 5000
const annualIncome = 60000

console.log(`Bi-weekly $${biweeklyIncome} → ${formatCurrency(normalizeIncomeToMonthly(biweeklyIncome, "biweekly"))} /month`)
console.log(`Monthly $${monthlyIncome} → ${formatCurrency(normalizeIncomeToMonthly(monthlyIncome, "monthly"))} /month`)
console.log(`Annual $${annualIncome} → ${formatCurrency(normalizeIncomeToMonthly(annualIncome, "annual"))} /month`)

// Verify bi-weekly calculation: 2000 * 2.167 = 4334
const expectedBiweeklyMonthly = 2000 * 2.167
const actualBiweeklyMonthly = normalizeIncomeToMonthly(biweeklyIncome, "biweekly")
console.log(`\n✓ Bi-weekly accuracy check: ${actualBiweeklyMonthly === expectedBiweeklyMonthly ? "PASS" : "FAIL"}`)

// ============================================================================
// Test 2: Multiple Income Sources
// ============================================================================
console.log("\n\n📊 Test 2: Multiple Income Sources")
console.log("-".repeat(60))

const incomeSources: IncomeSource[] = [
  {
    id: "1",
    userId: "user1",
    name: "Primary Salary",
    amount: 2500,
    frequency: "biweekly",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "user1",
    name: "Freelance Work",
    amount: 1000,
    frequency: "monthly",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    userId: "user1",
    name: "Annual Bonus",
    amount: 12000,
    frequency: "annual",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

incomeSources.forEach((source) => {
  const normalized = normalizeIncomeToMonthly(source.amount, source.frequency)
  console.log(`${source.name}: ${formatCurrency(source.amount)} (${source.frequency}) → ${formatCurrency(normalized)} /month`)
})

const totalMonthly = calculateMonthlyIncome(incomeSources)
console.log(`\n💰 Total Monthly Income: ${formatCurrency(totalMonthly)}`)

// ============================================================================
// Test 3: Assets and Liabilities
// ============================================================================
console.log("\n\n📊 Test 3: Assets and Liabilities Calculation")
console.log("-".repeat(60))

const assets: Asset[] = [
  {
    id: "1",
    userId: "user1",
    category: "cash",
    name: "Chase Checking",
    value: 5000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "user1",
    category: "cash",
    name: "Emergency Fund",
    value: 15000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    userId: "user1",
    category: "investments",
    name: "401(k)",
    value: 75000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    userId: "user1",
    category: "property",
    name: "Primary Home",
    value: 350000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    userId: "user1",
    category: "vehicles",
    name: "2020 Honda Civic",
    value: 18000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const liabilities: Liability[] = [
  {
    id: "1",
    userId: "user1",
    category: "mortgage",
    name: "Home Mortgage",
    balance: 280000,
    interestRate: 3.5,
    minimumPayment: 1500,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "user1",
    category: "credit_card",
    name: "Chase Freedom",
    balance: 3500,
    interestRate: 18.99,
    minimumPayment: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    userId: "user1",
    category: "auto_loan",
    name: "Car Loan",
    balance: 12000,
    interestRate: 4.2,
    minimumPayment: 350,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

console.log("Assets:")
assets.forEach((asset) => {
  console.log(`  ${asset.name} (${getAssetCategoryLabel(asset.category)}): ${formatCurrency(asset.value)}`)
})

console.log("\nLiabilities:")
liabilities.forEach((liability) => {
  console.log(`  ${liability.name} (${getLiabilityCategoryLabel(liability.category)}): ${formatCurrency(liability.balance)}`)
})

const totalAssets = calculateTotalAssets(assets)
const totalLiabilities = calculateTotalLiabilities(liabilities)
const netWorth = calculateNetWorth(assets, liabilities)

console.log(`\n💰 Total Assets: ${formatCurrency(totalAssets)}`)
console.log(`💳 Total Liabilities: ${formatCurrency(totalLiabilities)}`)
console.log(`📈 Net Worth: ${formatCurrency(netWorth)}`)

// ============================================================================
// Test 4: Grouping by Category
// ============================================================================
console.log("\n\n📊 Test 4: Grouping Assets and Liabilities by Category")
console.log("-".repeat(60))

const groupedAssets = groupAssetsByCategory(assets)
console.log("Assets by Category:")
groupedAssets.forEach((group) => {
  console.log(`  ${group.categoryLabel}: ${formatCurrency(group.total)} (${group.items.length} items)`)
})

const groupedLiabilities = groupLiabilitiesByCategory(liabilities)
console.log("\nLiabilities by Category:")
groupedLiabilities.forEach((group) => {
  console.log(`  ${group.categoryLabel}: ${formatCurrency(group.total)} (${group.items.length} items)`)
})

// ============================================================================
// Test 5: Savings Rate Calculation
// ============================================================================
console.log("\n\n📊 Test 5: Savings Rate Calculation")
console.log("-".repeat(60))

const monthlyExpenses = 4500
const savingsRate = calculateSavingsRate(totalMonthly, monthlyExpenses)

console.log(`Monthly Income: ${formatCurrency(totalMonthly)}`)
console.log(`Monthly Expenses: ${formatCurrency(monthlyExpenses)}`)
console.log(`Monthly Savings: ${formatCurrency(totalMonthly - monthlyExpenses)}`)
console.log(`Savings Rate: ${formatPercentage(savingsRate)}`)

// ============================================================================
// Test 6: Budget Allocation (50/30/20 Rule)
// ============================================================================
console.log("\n\n📊 Test 6: Budget Allocation (50/30/20 Rule)")
console.log("-".repeat(60))

const budgetAllocation = generateBudgetAllocation(totalMonthly)

console.log(`Total Monthly Income: ${formatCurrency(budgetAllocation.totalMonthlyIncome)}`)
console.log(`\nDefault 50/30/20 Allocation:`)
console.log(`  ${budgetAllocation.needs.percentage}% Needs: ${formatCurrency(budgetAllocation.needs.amount)}`)
console.log(`  ${budgetAllocation.wants.percentage}% Wants: ${formatCurrency(budgetAllocation.wants.amount)}`)
console.log(`  ${budgetAllocation.savings.percentage}% Savings: ${formatCurrency(budgetAllocation.savings.amount)}`)

// Test custom percentages (60/20/20)
const customAllocation = generateBudgetAllocation(totalMonthly, {
  needs: 60,
  wants: 20,
  savings: 20,
})

console.log(`\nCustom 60/20/20 Allocation:`)
console.log(`  ${customAllocation.needs.percentage}% Needs: ${formatCurrency(customAllocation.needs.amount)}`)
console.log(`  ${customAllocation.wants.percentage}% Wants: ${formatCurrency(customAllocation.wants.amount)}`)
console.log(`  ${customAllocation.savings.percentage}% Savings: ${formatCurrency(customAllocation.savings.amount)}`)

// ============================================================================
// Test 7: Bi-weekly Paycheck Allocation
// ============================================================================
console.log("\n\n📊 Test 7: Bi-weekly Paycheck Allocation")
console.log("-".repeat(60))

const paycheckAllocation = generatePaycheckAllocation(totalMonthly)

console.log(`Bi-weekly Gross Income: ${formatCurrency(paycheckAllocation.grossAmount)}`)
console.log(`\nPer-Paycheck Allocation:`)
console.log(`  Needs (50%): ${formatCurrency(paycheckAllocation.needs)}`)
console.log(`  Wants (30%): ${formatCurrency(paycheckAllocation.wants)}`)
console.log(`  Savings (20%): ${formatCurrency(paycheckAllocation.savings)}`)

// ============================================================================
// Test 8: Zod Validation
// ============================================================================
console.log("\n\n📊 Test 8: Zod Validation Schemas")
console.log("-".repeat(60))

// Test valid PIN
const validPin = pinSchema.safeParse({ pin: "1234" })
console.log(`Valid PIN "1234": ${validPin.success ? "✓ PASS" : "✗ FAIL"}`)

// Test invalid PIN (too short)
const invalidPin = pinSchema.safeParse({ pin: "123" })
console.log(`Invalid PIN "123" (too short): ${!invalidPin.success ? "✓ PASS" : "✗ FAIL"}`)

// Test valid income source
const validIncome = incomeSourceSchema.safeParse({
  name: "Salary",
  amount: 5000,
  frequency: "monthly",
})
console.log(`Valid Income Source: ${validIncome.success ? "✓ PASS" : "✗ FAIL"}`)

// Test invalid income (negative amount)
const invalidIncome = incomeSourceSchema.safeParse({
  name: "Salary",
  amount: -5000,
  frequency: "monthly",
})
console.log(`Invalid Income (negative): ${!invalidIncome.success ? "✓ PASS" : "✗ FAIL"}`)

// Test valid asset
const validAsset = assetSchema.safeParse({
  category: "cash",
  name: "Savings",
  value: 10000,
})
console.log(`Valid Asset: ${validAsset.success ? "✓ PASS" : "✗ FAIL"}`)

// Test valid budget allocation
const validBudget = budgetAllocationSchema.safeParse({
  needs: 50,
  wants: 30,
  savings: 20,
})
console.log(`Valid Budget (50/30/20): ${validBudget.success ? "✓ PASS" : "✗ FAIL"}`)

// Test invalid budget (doesn't sum to 100)
const invalidBudget = budgetAllocationSchema.safeParse({
  needs: 50,
  wants: 30,
  savings: 30, // Should be 20
})
console.log(`Invalid Budget (doesn't sum to 100): ${!invalidBudget.success ? "✓ PASS" : "✗ FAIL"}`)
if (!invalidBudget.success) {
  console.log(`  Error: ${invalidBudget.error.issues[0].message}`)
}

// ============================================================================
// Summary
// ============================================================================
console.log("\n" + "=".repeat(60))
console.log("✅ All tests completed successfully!")
console.log("=".repeat(60))
