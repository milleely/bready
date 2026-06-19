/**
 * Category Mapping Utilities
 *
 * Maps Bready expense categories to 50/30/20 budget categories:
 * - Needs: Essential expenses (groceries, utilities, healthcare, transportation, rent)
 * - Wants: Discretionary spending (dining, entertainment, shopping, travel, subscriptions, other)
 * - Other: Fallback only — any category not listed above (e.g. legacy values)
 */

export const EXPENSE_TO_BUDGET_MAPPING = {
  needs: [
    'groceries',
    'utilities',
    'healthcare',
    'transportation',
    'rent'
  ],
  wants: [
    'dining',
    'entertainment',
    'shopping',
    'travel',
    'subscriptions',
    'other'
  ],
  other: []
} as const

/**
 * Categorize an expense category into budget type
 * @param expenseCategory - Bready expense category (e.g., "groceries", "dining")
 * @returns Budget category type: "needs", "wants", or "other"
 */
export function categorizeBudgetType(expenseCategory: string): 'needs' | 'wants' | 'other' {
  if (EXPENSE_TO_BUDGET_MAPPING.needs.includes(expenseCategory as any)) {
    return 'needs'
  }
  if (EXPENSE_TO_BUDGET_MAPPING.wants.includes(expenseCategory as any)) {
    return 'wants'
  }
  return 'other'
}
