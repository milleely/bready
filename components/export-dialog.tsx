"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Download } from "lucide-react"
import { categories } from "@/lib/utils"

interface User {
  id: string
  name: string
}

interface ExportDialogProps {
  users: User[]
}

export function ExportDialog({ users }: ExportDialogProps) {
  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<{
    userId: string | undefined
    category: string | undefined
    startDate: string
    endDate: string
  }>({
    userId: undefined,
    category: undefined,
    startDate: '',
    endDate: '',
  })
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.userId) params.append('userId', filters.userId)
      if (filters.category) params.append('category', filters.category)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/expenses/export?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bready-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setOpen(false)
      setFilters({ userId: undefined, category: undefined, startDate: '', endDate: '' })
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export expenses. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Expenses</DialogTitle>
          <DialogDescription>
            Download your expenses as a CSV file. Apply optional filters below.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="user-filter" className="text-golden-crust-dark font-semibold">Filter by User (Optional)</Label>
            <Select value={filters.userId} onValueChange={(value) => setFilters({ ...filters, userId: value })}>
              <SelectTrigger id="user-filter" className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectValue placeholder="All users" />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category-filter" className="text-golden-crust-dark font-semibold">Filter by Category (Optional)</Label>
            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger id="category-filter" className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="start-date" className="text-golden-crust-dark font-semibold">Start Date (Optional)</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="end-date" className="text-golden-crust-dark font-semibold">End Date (Optional)</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={exporting}
            className="border border-golden-crust-medium text-golden-crust-dark hover:bg-amber-100 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
          >
            {exporting ? (
              <>
                <Download className="mr-2 h-4 w-4 animate-pulse" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
