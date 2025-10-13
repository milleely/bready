"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { categories } from "@/lib/utils"
import { Plus, Upload, X, Image as ImageIcon } from "lucide-react"

interface User {
  id: string
  name: string
  color: string
}

interface Expense {
  id?: string
  amount: number
  category: string
  description: string
  date: Date | string
  isShared: boolean
  receiptUrl?: string | null
  userId: string
}

interface ExpenseFormProps {
  users: User[]
  expense?: Expense
  onSubmit: (expense: Omit<Expense, 'id'>) => Promise<void>
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ExpenseForm({ users, expense, onSubmit, trigger, open: controlledOpen, onOpenChange: controlledOnOpenChange }: ExpenseFormProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [formData, setFormData] = useState({
    amount: expense?.amount?.toString() || '',
    category: expense?.category || 'groceries',
    description: expense?.description || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    isShared: expense?.isShared || false,
    userId: expense?.userId || users[0]?.id || '',
  })
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(expense?.receiptUrl || null)
  const [uploading, setUploading] = useState(false)

  // Use controlled open state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        category: expense.category,
        description: expense.description,
        date: new Date(expense.date).toISOString().split('T')[0],
        isShared: expense.isShared,
        userId: expense.userId,
      })
      setReceiptUrl(expense.receiptUrl || null)
      // Auto-open dialog when editing
      setOpen(true)
    }
  }, [expense])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File too large. Maximum size is 5MB.')
        return
      }
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only JPG, PNG, and PDF are allowed.')
        return
      }
      setSelectedFile(file)
    }
  }

  const removeReceipt = () => {
    setSelectedFile(null)
    setReceiptUrl(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let uploadedReceiptUrl = receiptUrl // Keep existing if editing

      // Upload new file if selected
      if (selectedFile) {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          const errorData = await uploadRes.json()
          alert(errorData.error || 'Failed to upload receipt')
          setUploading(false)
          setLoading(false)
          return
        }

        const { receiptUrl: newReceiptUrl } = await uploadRes.json()
        uploadedReceiptUrl = newReceiptUrl
        setUploading(false)
      }

      await onSubmit({
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date),
        isShared: formData.isShared,
        receiptUrl: uploadedReceiptUrl,
        userId: formData.userId,
      })

      if (!expense) {
        setFormData({
          amount: '',
          category: 'groceries',
          description: '',
          date: new Date().toISOString().split('T')[0],
          isShared: false,
          userId: users[0]?.id || '',
        })
        setSelectedFile(null)
        setReceiptUrl(null)
      }

      setOpen(false)
    } catch (error) {
      console.error('Failed to submit expense:', error)
      alert('Failed to submit expense. Please try again.')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-golden-crust-dark font-semibold">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
                required
              />
            </div>
            <div className="space-y-2 max-w-xs sm:max-w-none">
              <Label htmlFor="date" className="text-golden-crust-dark font-semibold">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-golden-crust-dark font-semibold">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectValue />
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

          <div className="space-y-2">
            <Label htmlFor="description" className="text-golden-crust-dark font-semibold">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark placeholder:text-golden-crust-dark/60"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user" className="text-golden-crust-dark font-semibold">User</Label>
            <Select value={formData.userId} onValueChange={(value) => setFormData({ ...formData, userId: value })}>
              <SelectTrigger className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: user.color }} />
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt" className="text-golden-crust-dark font-semibold">Receipt (Optional)</Label>
            <div className="space-y-2">
              {/* Hidden file input */}
              <input
                id="receipt"
                type="file"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Show preview if file selected or receipt exists */}
              {(selectedFile || receiptUrl) ? (
                <div className="flex items-center gap-3 p-3 bg-amber-50/50 border border-golden-crust-medium rounded-md">
                  <ImageIcon className="h-5 w-5 text-golden-crust-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-golden-crust-dark font-medium truncate">
                      {selectedFile ? selectedFile.name : 'Receipt attached'}
                    </p>
                    <p className="text-xs text-golden-crust-dark/60">
                      {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'View receipt'}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeReceipt}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('receipt')?.click()}
                  className="w-full border border-golden-crust-medium text-golden-crust-dark hover:bg-amber-100"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Receipt (JPG, PNG, or PDF)
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="shared"
              type="checkbox"
              checked={formData.isShared}
              onChange={(e) => setFormData({ ...formData, isShared: e.target.checked })}
              className="rounded border-golden-crust-medium"
            />
            <Label htmlFor="shared" className="cursor-pointer text-golden-crust-dark">
              This is a shared expense (split among all users)
            </Label>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border border-golden-crust-medium text-golden-crust-dark hover:bg-amber-100 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
            >
              {uploading ? 'Uploading...' : loading ? 'Saving...' : expense ? 'Update' : 'Add Expense'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
