import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const categories = [
  { value: 'groceries', label: 'Groceries', color: '#16a34a' },
  { value: 'utilities', label: 'Utilities', color: '#3b82f6' },
  { value: 'subscriptions', label: 'Subscriptions', color: '#a855f7' },
  { value: 'dining', label: 'Dining Out', color: '#f97316' },
  { value: 'transportation', label: 'Transportation', color: '#dc2626' },
  { value: 'entertainment', label: 'Entertainment', color: '#ec4899' },
  { value: 'other', label: 'Other', color: '#78716c' },
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
