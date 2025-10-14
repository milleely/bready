"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExportDialog } from "@/components/export-dialog"
import { ExpenseDataTable } from "@/components/expense-data-table"
import { Filter, ChevronDown, ChevronUp, X } from "lucide-react"
import { categories } from "@/lib/utils"

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
  // Filter props
  selectedUser: string | null
  setSelectedUser: (id: string | null) => void
  selectedCategory: string | null
  setSelectedCategory: (category: string | null) => void
  selectedType: 'all' | 'shared' | 'personal'
  setSelectedType: (type: 'all' | 'shared' | 'personal') => void
  minAmount: number | null
  setMinAmount: (amount: number | null) => void
  maxAmount: number | null
  setMaxAmount: (amount: number | null) => void
  activeFilterCount: number
  onClearAllFilters: () => void
}

export function EnhancedRecentExpenses({
  expenses,
  users,
  onEdit,
  onDelete,
  selectedUser,
  setSelectedUser,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  minAmount,
  setMinAmount,
  maxAmount,
  setMaxAmount,
  activeFilterCount,
  onClearAllFilters,
}: EnhancedRecentExpensesProps) {
  const [showFilters, setShowFilters] = useState(false)

  return (
    <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-golden-crust-dark">Recent Expenses</CardTitle>
          <p className="text-sm text-golden-crust-dark/70 mt-1">Latest transactions from your household</p>
        </div>
        <ExportDialog users={users} />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter controls section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-amber-50 border-golden-crust-medium hover:bg-amber-100"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 bg-orange-500 text-white">
                  {activeFilterCount}
                </Badge>
              )}
              {showFilters ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAllFilters}
                className="text-xs hover:bg-orange-200"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Collapsible filter grid */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-white/50 rounded-lg border border-golden-crust-medium">
              {/* User Filter */}
              <div className="space-y-2">
                <Label htmlFor="filter-user" className="text-golden-crust-dark font-semibold text-sm">
                  User
                </Label>
                <Select
                  value={selectedUser || "all"}
                  onValueChange={(value) => setSelectedUser(value === "all" ? null : value)}
                >
                  <SelectTrigger
                    id="filter-user"
                    className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark h-9"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: user.color }}
                          />
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="filter-category" className="text-golden-crust-dark font-semibold text-sm">
                  Category
                </Label>
                <Select
                  value={selectedCategory || "all"}
                  onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                >
                  <SelectTrigger
                    id="filter-category"
                    className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark h-9"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cat.icon}</span>
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expense Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="filter-type" className="text-golden-crust-dark font-semibold text-sm">
                  Type
                </Label>
                <Select
                  value={selectedType}
                  onValueChange={(value) => setSelectedType(value as 'all' | 'shared' | 'personal')}
                >
                  <SelectTrigger
                    id="filter-type"
                    className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark h-9"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                    <SelectItem value="all">All Expenses</SelectItem>
                    <SelectItem value="shared">Shared Only</SelectItem>
                    <SelectItem value="personal">Personal Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Min Amount Filter */}
              <div className="space-y-2">
                <Label htmlFor="filter-min" className="text-golden-crust-dark font-semibold text-sm">
                  Min Amount
                </Label>
                <Input
                  id="filter-min"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="$0.00"
                  value={minAmount ?? ""}
                  onChange={(e) => setMinAmount(e.target.value ? parseFloat(e.target.value) : null)}
                  className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark h-9"
                />
              </div>

              {/* Max Amount Filter */}
              <div className="space-y-2">
                <Label htmlFor="filter-max" className="text-golden-crust-dark font-semibold text-sm">
                  Max Amount
                </Label>
                <Input
                  id="filter-max"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="$999.99"
                  value={maxAmount ?? ""}
                  onChange={(e) => setMaxAmount(e.target.value ? parseFloat(e.target.value) : null)}
                  className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark h-9"
                />
              </div>
            </div>
          )}
        </div>

        {/* Expense table */}
        <ExpenseDataTable
          expenses={expenses}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  )
}
