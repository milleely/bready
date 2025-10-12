"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExportDialog } from "@/components/export-dialog"
import { ExpenseDataTable } from "@/components/expense-data-table"

interface User {
  id: string
  name: string
  email: string | null
  color: string
}

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: Date | string
  isShared: boolean
  userId: string
  recurringExpenseId?: string | null
  user: {
    id: string
    name: string
    email: string | null
    color: string
  }
}

interface EnhancedRecentExpensesProps {
  expenses: Expense[]
  users: User[]
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
}

export function EnhancedRecentExpenses({ expenses, users, onEdit, onDelete }: EnhancedRecentExpensesProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-golden-crust-dark">Recent Expenses</CardTitle>
          <p className="text-sm text-golden-crust-dark/70 mt-1">Latest transactions from your household</p>
        </div>
        <ExportDialog users={users} />
      </CardHeader>
      <CardContent>
        <ExpenseDataTable
          expenses={expenses}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  )
}
