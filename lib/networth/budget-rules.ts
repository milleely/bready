/**
 * Budget Allocation Rule Presets
 *
 * Defines common budget allocation strategies with different
 * percentage splits for needs, wants, and savings.
 */

export interface BudgetRulePreset {
  id: string
  name: string
  description: string
  percentages: {
    needs: number
    wants: number
    savings: number
  }
}

export const BUDGET_RULES: BudgetRulePreset[] = [
  {
    id: "balanced",
    name: "50/30/20 (Balanced)",
    description: "Standard rule - balanced approach to needs, wants, and savings",
    percentages: {
      needs: 50,
      wants: 30,
      savings: 20,
    },
  },
  {
    id: "conservative",
    name: "70/20/10 (Conservative)",
    description: "Focus on needs - ideal for tight budgets or high cost of living",
    percentages: {
      needs: 70,
      wants: 20,
      savings: 10,
    },
  },
  {
    id: "moderate",
    name: "60/20/20 (Moderate Saver)",
    description: "Balanced needs with stronger savings focus",
    percentages: {
      needs: 60,
      wants: 20,
      savings: 20,
    },
  },
  {
    id: "aggressive",
    name: "40/30/30 (Aggressive Saver)",
    description: "Maximum savings - ideal for financial independence goals",
    percentages: {
      needs: 40,
      wants: 30,
      savings: 30,
    },
  },
]

export const DEFAULT_BUDGET_RULE = "balanced"

export function getBudgetRule(id: string): BudgetRulePreset | undefined {
  return BUDGET_RULES.find((rule) => rule.id === id)
}

export function getBudgetRulePercentages(id: string) {
  const rule = getBudgetRule(id)
  return rule ? rule.percentages : BUDGET_RULES[0].percentages
}
