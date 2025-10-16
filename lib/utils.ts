import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: 'groceries', label: 'Groceries', color: '#f59e0b', icon: '🥖' }, // amber-500 (perfect toast)
  { value: 'utilities', label: 'Utilities', color: '#92400e', icon: '⚡' }, // amber-800 (dark crust)
  { value: 'subscriptions', label: 'Subscriptions', color: '#fbbf24', icon: '📱' }, // amber-400 (fresh toast)
  { value: 'dining', label: 'Dining Out', color: '#ea580c', icon: '🍽️' }, // orange-600 (compatible)
  { value: 'transportation', label: 'Transportation', color: '#b45309', icon: '🚗' }, // amber-700 (burnt toast)
  { value: 'entertainment', label: 'Entertainment', color: '#d97706', icon: '🎬' }, // amber-600 (golden toast)
  { value: 'healthcare', label: 'Healthcare', color: '#fed7aa', icon: '💊' }, // orange-200 (light toast)
  { value: 'household', label: 'Household Items', color: '#fde68a', icon: '🏠' }, // amber-200 (bread crumb)
  { value: 'personal-care', label: 'Personal Care', color: '#fef3c7', icon: '✨' }, // amber-100 (lightest crumb)
  { value: 'shopping', label: 'Shopping', color: '#fffbeb', icon: '👕' }, // amber-50 (soft crumb)
  { value: 'pets', label: 'Pets', color: '#facc15', icon: '🐾' }, // yellow-400 (toast-compatible)
  { value: 'gifts', label: 'Gifts', color: '#fb923c', icon: '🎁' }, // orange-400 (warm toast)
  { value: 'travel', label: 'Travel', color: '#fdba74', icon: '✈️' }, // orange-300 (light orange)
  { value: 'home-maintenance', label: 'Home Maintenance', color: '#78350f', icon: '🔧' }, // amber-900 (charred crust)
  { value: 'other', label: 'Other', color: '#451a03', icon: '📦' }, // amber-950 (darkest crust)
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
