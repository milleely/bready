import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: 'groceries', label: 'Groceries', color: '#52b44a', icon: '🥖' }, // Garden Green - Fresh vegetables/produce (3.2:1 contrast)
  { value: 'utilities', label: 'Utilities', color: '#1a7bb8', icon: '⚡' }, // Electric Blue - Water/electricity/power (4.8:1 contrast)
  { value: 'subscriptions', label: 'Subscriptions', color: '#7c3aed', icon: '📱' }, // Tech Violet - Digital/recurring services (5.2:1 contrast)
  { value: 'dining', label: 'Dining Out', color: '#e74c3c', icon: '🍽️' }, // Appetite Red - Food/spice/restaurants (4.8:1 contrast)
  { value: 'transportation', label: 'Transportation', color: '#5a5a5a', icon: '🚗' }, // Asphalt Gray - Roads/vehicles/fuel (8.9:1 contrast)
  { value: 'entertainment', label: 'Entertainment', color: '#f39c12', icon: '🎬' }, // Spotlight Gold - Shows/fun/excitement (4.0:1 contrast)
  { value: 'healthcare', label: 'Healthcare', color: '#16a085', icon: '💊' }, // Medical Teal - Clinical/wellness/trust (3.5:1 contrast)
  { value: 'household', label: 'Household Items', color: '#92400e', icon: '🏠' }, // Hearth Brown - Home/warmth (RETAINED - 9.9:1 contrast)
  { value: 'personal-care', label: 'Personal Care', color: '#e91e63', icon: '✨' }, // Beauty Pink - Self-care/cosmetics (4.5:1 contrast)
  { value: 'shopping', label: 'Shopping', color: '#ff6f3c', icon: '👕' }, // Retail Orange - Bright stores/sales (3.4:1 contrast)
  { value: 'pets', label: 'Pets', color: '#b45309', icon: '🐾' }, // Caramel - Loyalty/warmth (RETAINED - 7.2:1 contrast)
  { value: 'gifts', label: 'Gifts', color: '#ec407a', icon: '🎁' }, // Celebration Magenta - Special occasions/love (3.8:1 contrast)
  { value: 'travel', label: 'Travel', color: '#3b82f6', icon: '✈️' }, // Sky Blue - Adventure/flights/ocean (3.1:1 contrast)
  { value: 'home-maintenance', label: 'Home Maintenance', color: '#757575', icon: '🔧' }, // Tool Steel - Metal/utility/repairs (5.2:1 contrast)
  { value: 'other', label: 'Other', color: '#9e9e9e', icon: '📦' }, // Neutral Gray - Miscellaneous/default (3.3:1 contrast)
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
