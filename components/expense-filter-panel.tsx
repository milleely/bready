"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import { categories } from "@/lib/utils"

interface User {
  id: string
  name: string
  color: string
}

interface ExpenseFilterPanelProps {
  users: User[]
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
  onClearAll: () => void
}

export function ExpenseFilterPanel({
  users,
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
  onClearAll,
}: ExpenseFilterPanelProps) {
  return (
    <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-golden-crust-dark">
            <Filter className="h-5 w-5" />
            Filter Expenses
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-orange-500 text-white">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs hover:bg-orange-200"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* User Filter */}
          <div className="space-y-2">
            <Label htmlFor="filter-user" className="text-golden-crust-dark font-semibold">
              User
            </Label>
            <Select
              value={selectedUser || "all"}
              onValueChange={(value) => setSelectedUser(value === "all" ? null : value)}
            >
              <SelectTrigger
                id="filter-user"
                className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
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
            <Label htmlFor="filter-category" className="text-golden-crust-dark font-semibold">
              Category
            </Label>
            <Select
              value={selectedCategory || "all"}
              onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
            >
              <SelectTrigger
                id="filter-category"
                className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
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
            <Label htmlFor="filter-type" className="text-golden-crust-dark font-semibold">
              Type
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as 'all' | 'shared' | 'personal')}
            >
              <SelectTrigger
                id="filter-type"
                className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
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
            <Label htmlFor="filter-min" className="text-golden-crust-dark font-semibold">
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
              className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
            />
          </div>

          {/* Max Amount Filter */}
          <div className="space-y-2">
            <Label htmlFor="filter-max" className="text-golden-crust-dark font-semibold">
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
              className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
