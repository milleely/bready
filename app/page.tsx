"use client"

import { useEffect, useState } from "react"
import { MetricsCards } from "@/components/metrics-cards"
import { SpendingCharts } from "@/components/spending-charts"
import { RecentExpenses } from "@/components/recent-expenses"
import { ExpenseForm } from "@/components/expense-form"
import { ExportDialog } from "@/components/export-dialog"
import { UserManagement } from "@/components/user-management"
import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

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
  user: User
}

interface Stats {
  totalSpent: number
  sharedExpenses: number
  spendingPerPerson: Array<{
    userId: string
    name: string
    color: string
    total: number
    shared: number
    personal: number
  }>
  spendingByCategory: Array<{ category: string; amount: number }>
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [stats, setStats] = useState<Stats>({
    totalSpent: 0,
    sharedExpenses: 0,
    spendingPerPerson: [],
    spendingByCategory: [],
  })
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>()
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [usersRes, expensesRes, statsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/expenses'),
        fetch('/api/stats'),
      ])

      const [usersData, expensesData, statsData] = await Promise.all([
        usersRes.json(),
        expensesRes.json(),
        statsRes.json(),
      ])

      setUsers(usersData)
      setExpenses(expensesData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'user'>) => {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })

    if (response.ok) {
      await fetchData()
    }
  }

  const handleEditExpense = async (expense: Omit<Expense, 'id' | 'user'>) => {
    if (!editingExpense) return

    const response = await fetch(`/api/expenses/${editingExpense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    })

    if (response.ok) {
      setEditingExpense(undefined)
      await fetchData()
    }
  }

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return

    const response = await fetch(`/api/expenses/${id}`, {
      method: 'DELETE',
    })

    if (response.ok) {
      await fetchData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Wallet className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    )
  }

  const avgPerPerson = stats.spendingPerPerson.length > 0
    ? stats.totalSpent / stats.spendingPerPerson.length
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-orange-50/20 to-yellow-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 bg-clip-text text-transparent">
              Bready
            </h1>
            <p className="text-muted-foreground mt-2">Track your spending and watch your dough rise</p>
          </div>
          <div className="flex gap-3">
            <ExportDialog users={users} />
            <ExpenseForm users={users} onSubmit={handleAddExpense} />
          </div>
        </div>

        <div className="space-y-6">
          <MetricsCards
            totalSpent={stats.totalSpent}
            sharedExpenses={stats.sharedExpenses}
            userCount={users.length}
            avgPerPerson={avgPerPerson}
          />

          <SpendingCharts
            spendingByCategory={stats.spendingByCategory}
            spendingPerPerson={stats.spendingPerPerson}
          />

          <UserManagement users={users} onRefresh={fetchData} />

          <RecentExpenses
            expenses={expenses}
            onEdit={(expense) => setEditingExpense(expense)}
            onDelete={handleDeleteExpense}
          />
        </div>

        {editingExpense && (
          <ExpenseForm
            users={users}
            expense={editingExpense}
            onSubmit={handleEditExpense}
            trigger={<Button className="hidden" />}
          />
        )}
      </div>
    </div>
  )
}
