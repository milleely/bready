"use client"

/**
 * Asset Form Dialog Component
 *
 * Modal dialog for adding or editing assets.
 */

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TrendingUp } from "lucide-react"
import { toast } from "sonner"
import type { Asset, AssetCategory } from "@/lib/types/networth"
import { ASSET_CATEGORIES } from "@/lib/networth/categories"

interface AssetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  asset?: Asset | null // If provided, editing mode
  onSave: (data: {
    category: AssetCategory
    name: string
    value: number
    notes?: string
  }) => Promise<void>
}

export function AssetFormDialog({ open, onOpenChange, asset, onSave }: AssetFormDialogProps) {
  const [category, setCategory] = useState<AssetCategory>("cash")
  const [name, setName] = useState("")
  const [value, setValue] = useState("")
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const isEditing = !!asset

  // Populate form when editing
  useEffect(() => {
    if (asset) {
      setCategory(asset.category as AssetCategory)
      setName(asset.name)
      setValue(asset.value.toString())
      setNotes(asset.notes ?? "")
    } else {
      setCategory("cash")
      setName("")
      setValue("")
      setNotes("")
    }
  }, [asset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("Please enter an asset name")
      return
    }

    const parsedValue = parseFloat(value)
    if (isNaN(parsedValue) || parsedValue < 0) {
      toast.error("Please enter a valid non-negative value")
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        category,
        name: name.trim(),
        value: parsedValue,
        notes: notes.trim() || undefined,
      })
      toast.success(isEditing ? "Asset updated" : "Asset added")
      onOpenChange(false)
    } catch (error) {
      toast.error("Failed to save asset")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <DialogTitle>{isEditing ? "Edit" : "Add"} Asset</DialogTitle>
          </div>
          <DialogDescription>
            {isEditing ? "Update your asset details" : "Add a new asset to track"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="asset-category">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as AssetCategory)}>
              <SelectTrigger id="asset-category" className="bg-amber-50/50 border border-golden-crust-medium text-golden-crust-dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-amber-50 border border-golden-crust-medium text-golden-crust-dark max-h-[280px]">
                {ASSET_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-stone-500">
              {ASSET_CATEGORIES.find((c) => c.value === category)?.description}
            </p>
          </div>

          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name</Label>
            <Input
              id="asset-name"
              placeholder="e.g., Chase Checking, 401(k), Primary Home, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              autoFocus
            />
          </div>

          {/* Current Value */}
          <div className="space-y-2">
            <Label htmlFor="asset-value">Current Value</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">$</span>
              <Input
                id="asset-value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-6"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="asset-notes">Notes (Optional)</Label>
            <Textarea
              id="asset-notes"
              placeholder="Additional details about this asset..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : isEditing ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
