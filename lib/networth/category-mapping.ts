/**
 * Category Mapping Utilities
 *
 * Maps Bready expense categories to 50/30/20 budget categories:
 * - Needs: Essential expenses (housing, utilities, food, healthcare, transportation)
 * - Wants: Discretionary spending (entertainment, dining out, shopping, subscriptions)
 * - Other: Uncategorized expenses
 */

export const EXPENSE_TO_BUDGET_MAPPING = {
  needs: [
    'groceries',
    'utilities',
    'healthcare',
    'transportation',
    'rent',
    'home-maintenance'
  ],
  wants: [
    'dining',
    'entertainment',
    'shopping',
    'personal-care',
    'gifts',
    'travel',
    'pets',
    'subscriptions'
  ],
  other: ['other']
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
