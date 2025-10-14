import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: 'groceries', label: 'Groceries', color: '#f59e0b', icon: '🥖' },
  { value: 'utilities', label: 'Utilities', color: '#6b7280', icon: '⚡' },
  { value: 'subscriptions', label: 'Subscriptions', color: '#a855f7', icon: '📱' },
  { value: 'dining', label: 'Dining Out', color: '#3b82f6', icon: '🍽️' },
  { value: 'transportation', label: 'Transportation', color: '#dc2626', icon: '🚗' },
  { value: 'entertainment', label: 'Entertainment', color: '#ec4899', icon: '🎬' },
  { value: 'healthcare', label: 'Healthcare', color: '#10b981', icon: '💊' },
  { value: 'household', label: 'Household Items', color: '#14b8a6', icon: '🏠' },
  { value: 'personal-care', label: 'Personal Care', color: '#d946ef', icon: '✨' },
  { value: 'shopping', label: 'Shopping', color: '#8b5cf6', icon: '👕' },
  { value: 'pets', label: 'Pets', color: '#eab308', icon: '🐾' },
  { value: 'gifts', label: 'Gifts', color: '#fb7185', icon: '🎁' },
  { value: 'travel', label: 'Travel', color: '#06b6d4', icon: '✈️' },
  { value: 'home-maintenance', label: 'Home Maintenance', color: '#475569', icon: '🔧' },
  { value: 'other', label: 'Other', color: '#78716c', icon: '📦' },
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
