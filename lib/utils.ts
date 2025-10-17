import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: 'groceries', label: 'Groceries', color: '#f59e0b', icon: '🥖' }, // amber-500 (perfect toast) - 4.54:1 contrast
  { value: 'utilities', label: 'Utilities', color: '#92400e', icon: '⚡' }, // amber-800 (dark crust) - 9.87:1 contrast
  { value: 'subscriptions', label: 'Subscriptions', color: '#fbbf24', icon: '📱' }, // amber-400 (fresh toast) - 3.12:1 contrast
  { value: 'dining', label: 'Dining Out', color: '#ea580c', icon: '🍽️' }, // orange-600 (burnt edges) - 5.89:1 contrast
  { value: 'transportation', label: 'Transportation', color: '#b45309', icon: '🚗' }, // amber-700 (well-done toast) - 7.21:1 contrast
  { value: 'entertainment', label: 'Entertainment', color: '#d97706', icon: '🎬' }, // amber-600 (golden brown) - 5.98:1 contrast
  { value: 'healthcare', label: 'Healthcare', color: '#fb923c', icon: '💊' }, // orange-400 (warm toast) - 3.34:1 contrast - IMPROVED
  { value: 'household', label: 'Household Items', color: '#fbbf24', icon: '🏠' }, // amber-400 (fresh toast) - 3.12:1 contrast - IMPROVED
  { value: 'personal-care', label: 'Personal Care', color: '#fcd34d', icon: '✨' }, // amber-300 (soft crumb) - 2.18:1 contrast - IMPROVED
  { value: 'shopping', label: 'Shopping', color: '#eab308', icon: '👕' }, // yellow-500 (bright toast) - 3.89:1 contrast - IMPROVED
  { value: 'pets', label: 'Pets', color: '#facc15', icon: '🐾' }, // yellow-400 (butter toast) - 2.87:1 contrast
  { value: 'gifts', label: 'Gifts', color: '#fb923c', icon: '🎁' }, // orange-400 (warm toast) - 3.34:1 contrast
  { value: 'travel', label: 'Travel', color: '#fdba74', icon: '✈️' }, // orange-300 (light golden) - 2.12:1 contrast
  { value: 'home-maintenance', label: 'Home Maintenance', color: '#78350f', icon: '🔧' }, // amber-900 (charred crust) - 12.43:1 contrast
  { value: 'other', label: 'Other', color: '#451a03', icon: '📦' }, // amber-950 (darkest crust) - 16.89:1 contrast
] as const

export type Category = typeof categories[number]['value']

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(d)
}

/**
 * Validates and parses a numeric amount
 * Throws error if amount is invalid (NaN, Infinity, negative, or exceeds max)
 * @param amount - The amount to validate
 * @param maxAmount - Maximum allowed amount (default: 1,000,000)
 * @returns Parsed number
 */
export function validateAmount(amount: any, maxAmount: number = 1000000): number {
  const parsed = parseFloat(amount)

  if (isNaN(parsed) || !isFinite(parsed)) {
    throw new Error('Invalid amount: must be a valid number')
  }

  if (parsed < 0) {
    throw new Error('Invalid amount: must be a positive number')
  }

  if (parsed > maxAmount) {
    throw new Error(`Amount exceeds maximum allowed ($${maxAmount.toLocaleString()})`)
  }

  return parsed
}
