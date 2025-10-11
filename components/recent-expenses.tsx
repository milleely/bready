"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ExportDialog } from "@/components/export-dialog"
import { formatCurrency, formatDate, categories } from "@/lib/utils"
import { Pencil, Trash2, Repeat } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
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
    color: string
  }
}

interface RecentExpensesProps {
  expenses: Expense[]
  users: User[]
  onEdit?: (expense: Expense) => void
  onDelete?: (id: string) => void
}

export function RecentExpenses({ expenses, users, onEdit, onDelete }: RecentExpensesProps) {
  const getCategoryLabel = (value: string) => {
    return categories.find(c => c.value === value)?.label || value
  }

  const getCategoryColor = (value: string) => {
    return categories.find(c => c.value === value)?.color || '#6b7280'
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Expenses</CardTitle>
        <ExportDialog users={users} />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No expenses found
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{formatDate(expense.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {expense.recurringExpenseId && (
                          <Repeat className="h-4 w-4 text-purple-600" title="Recurring expense" />
                        )}
                        {expense.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getCategoryColor(expense.category)}20`,
                          color: getCategoryColor(expense.category)
                        }}
                      >
                        {getCategoryLabel(expense.category)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: expense.user.color }}
                        />
                        <span>{expense.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {expense.isShared ? (
                        <span className="text-xs text-green-600 font-medium">Shared</span>
                      ) : (
                        <span className="text-xs text-blue-600 font-medium">Personal</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {onEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(expense)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
