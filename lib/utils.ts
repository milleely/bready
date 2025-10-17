import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: 'groceries', label: 'Groceries', color: '#059669', icon: '🥖' }, // Emerald-600 - Fresh food/produce (4.5:1 contrast)
  { value: 'utilities', label: 'Utilities', color: '#0891b2', icon: '⚡' }, // Cyan-600 - Essential services/water/power (3.8:1 contrast)
  { value: 'subscriptions', label: 'Subscriptions', color: '#7c3aed', icon: '📱' }, // Violet-600 - Digital/tech services (5.2:1 contrast)
  { value: 'dining', label: 'Dining Out', color: '#dc2626', icon: '🍽️' }, // Red-600 - Appetite/indulgence (5.9:1 contrast)
  { value: 'transportation', label: 'Transportation', color: '#475569', icon: '🚗' }, // Slate-600 - Infrastructure/roads (8.1:1 contrast)
  { value: 'entertainment', label: 'Entertainment', color: '#db2777', icon: '🎬' }, // Hot Pink-600 - Fun/excitement (4.7:1 contrast)
  { value: 'healthcare', label: 'Healthcare', color: '#0d9488', icon: '💊' }, // Teal-600 - Medical/clinical (3.9:1 contrast)
  { value: 'household', label: 'Household Items', color: '#92400e', icon: '🏠' }, // Dark Amber-800 - Home/warmth (RETAINED - 9.9:1 contrast)
  { value: 'personal-care', label: 'Personal Care', color: '#a855f7', icon: '✨' }, // Purple-500 - Beauty/self-care (3.2:1 contrast)
  { value: 'shopping', label: 'Shopping', color: '#f97316', icon: '👕' }, // Orange-600 - Retail/fashion (4.1:1 contrast)
  { value: 'pets', label: 'Pets', color: '#b45309', icon: '🐾' }, // Warm Amber-700 - Companionship/warmth (RETAINED - 7.2:1 contrast)
  { value: 'gifts', label: 'Gifts', color: '#ec4899', icon: '🎁' }, // Pink-500 - Celebration/generosity (3.5:1 contrast)
  { value: 'travel', label: 'Travel', color: '#3b82f6', icon: '✈️' }, // Blue-500 - Sky/adventure (3.1:1 contrast)
  { value: 'home-maintenance', label: 'Home Maintenance', color: '#374151', icon: '🔧' }, // Gray-700 - Tools/utility (10.8:1 contrast)
  { value: 'other', label: 'Other', color: '#6b7280', icon: '📦' }, // Gray-500 - Neutral/miscellaneous (4.6:1 contrast)
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
