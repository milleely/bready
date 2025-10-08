import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: 'groceries', label: 'Groceries', color: '#10b981' },
  { value: 'utilities', label: 'Utilities', color: '#3b82f6' },
  { value: 'subscriptions', label: 'Subscriptions', color: '#8b5cf6' },
  { value: 'dining', label: 'Dining Out', color: '#f59e0b' },
  { value: 'transportation', label: 'Transportation', color: '#ef4444' },
  { value: 'entertainment', label: 'Entertainment', color: '#ec4899' },
  { value: 'other', label: 'Other', color: '#6b7280' },
] as const

export type Category = typeof categories[number]['value']

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}
