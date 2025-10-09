import { unparse } from 'papaparse'
import { formatDate } from './utils'

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: Date | string
  isShared: boolean
  userId: string
  user: {
    id: string
    name: string
    email: string
    color: string
  }
}

interface CSVRow {
  Date: string
  Description: string
  Amount: string
  Category: string
  User: string
  Type: string
  'User Email': string
}

export function generateExpensesCSV(expenses: Expense[]): string {
  const rows: CSVRow[] = expenses.map((expense) => ({
    Date: formatDate(expense.date),
    Description: expense.description,
    Amount: `$${expense.amount.toFixed(2)}`,
    Category: expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
    User: expense.user.name,
    Type: expense.isShared ? 'Shared' : 'Personal',
    'User Email': expense.user.email,
  }))

  return unparse(rows, {
    quotes: true,
    header: true,
  })
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

export function generateCSVFilename(): string {
  const date = new Date().toISOString().split('T')[0]
  return `bready-export-${date}.csv`
}
