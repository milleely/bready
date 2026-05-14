"use client"

/**
 * PIN Setup Dialog Component
 *
 * Modal dialog for creating a new PIN for first-time users.
 * Requires PIN confirmation to prevent typos.
 */

import { useState } from "react"
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
import { Lock, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

interface PinSetupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  onSetup: (pin: string) => Promise<boolean>
}

export function PinSetupDialog({
  open,
  onOpenChange,
  userName,
  onSetup,
}: PinSetupDialogProps) {
  const [pin, setPin] = useState("")
  const [confirmPin, setConfirmPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pin.length < 4 || pin.length > 6) {
      toast.error("PIN must be 4-6 digits")
      return
    }

    if (pin !== confirmPin) {
      toast.error("PINs do not match")
      return
    }

    setIsSaving(true)
    const success = await onSetup(pin)
    setIsSaving(false)

    if (success) {
      toast.success("PIN created successfully!")
      setPin("")
      setConfirmPin("")
      onOpenChange(false)
    } else {
      toast.error("Failed to create PIN")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/40">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Set Up PIN</DialogTitle>
          </div>
          <DialogDescription>
            Create a secure PIN to protect {userName.trim()}'s net worth data
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Create PIN */}
          <div className="space-y-2">
            <Label htmlFor="create-pin">Create PIN (4-6 digits)</Label>
            <div className="relative">
              <Input
                id="create-pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  if (value.length <= 6) {
                    setPin(value)
                  }
                }}
                maxLength={6}
                className="pr-10"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-700"
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-stone-500">{pin.length}/6 digits</p>
          </div>

          {/* Confirm PIN */}
          <div className="space-y-2">
            <Label htmlFor="confirm-pin">Confirm PIN</Label>
            <Input
              id="confirm-pin"
              type={showPin ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Re-enter PIN"
              value={confirmPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "")
                if (value.length <= 6) {
                  setConfirmPin(value)
                }
              }}
              maxLength={6}
            />
            {confirmPin && pin !== confirmPin && (
              <p className="text-xs text-red-600">PINs do not match</p>
            )}
            {confirmPin && pin === confirmPin && (
              <p className="text-xs text-emerald-600">PINs match ✓</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPin("")
                setConfirmPin("")
                onOpenChange(false)
              }}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pin.length < 4 || pin !== confirmPin || isSaving}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-amber-950"
            >
              {isSaving ? "Creating..." : "Create PIN"}
            </Button>
          </div>

          {/* Security Note */}
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800">
              🔒 <strong>Security Note:</strong> Choose a PIN you can remember but others can't
              guess. Avoid birthdays or simple patterns.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

