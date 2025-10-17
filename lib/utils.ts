import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: 'groceries', label: 'Groceries', color: '#e67e22', icon: '🥖' }, // Carrot Orange - Fresh vegetables (4.2:1 contrast)
  { value: 'utilities', label: 'Utilities', color: '#d35400', icon: '⚡' }, // Burnt Orange - Heat/power (6.4:1 contrast)
  { value: 'subscriptions', label: 'Subscriptions', color: '#e74c3c', icon: '📱' }, // Tomato Red - Recurring services (4.8:1 contrast)
  { value: 'dining', label: 'Dining Out', color: '#c0392b', icon: '🍽️' }, // Pomegranate - Fine dining (7.1:1 contrast)
  { value: 'transportation', label: 'Transportation', color: '#7f4f24', icon: '🚗' }, // Saddle Brown - Earthy/roads (8.2:1 contrast)
  { value: 'entertainment', label: 'Entertainment', color: '#fd7e14', icon: '🎬' }, // Tangerine - Vibrant/fun (3.9:1 contrast)
  { value: 'healthcare', label: 'Healthcare', color: '#f39c12', icon: '💊' }, // Orange Peel - Vitality (4.0:1 contrast)
  { value: 'household', label: 'Household Items', color: '#92400e', icon: '🏠' }, // Dark Amber - Home/warmth (RETAINED - 9.9:1 contrast)
  { value: 'personal-care', label: 'Personal Care', color: '#f8b739', icon: '✨' }, // Honey Gold - Beauty/glow (2.8:1 contrast)
  { value: 'shopping', label: 'Shopping', color: '#f1c40f', icon: '👕' }, // Sunflower - Bright retail (3.2:1 contrast)
  { value: 'pets', label: 'Pets', color: '#b45309', icon: '🐾' }, // Caramel - Warmth/loyalty (RETAINED - 7.2:1 contrast)
  { value: 'gifts', label: 'Gifts', color: '#ff6b6b', icon: '🎁' }, // Coral Pink - Celebration (3.4:1 contrast)
  { value: 'travel', label: 'Travel', color: '#f7dc6f', icon: '✈️' }, // Banana - Sunshine/adventure (2.1:1 contrast)
  { value: 'home-maintenance', label: 'Home Maintenance', color: '#935116', icon: '🔧' }, // Copper - Tools/metal (8.8:1 contrast)
  { value: 'other', label: 'Other', color: '#b8860b', icon: '📦' }, // Dark Goldenrod - Neutral (5.0:1 contrast)
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
