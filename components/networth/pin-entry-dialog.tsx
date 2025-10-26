"use client"

/**
 * PIN Entry Dialog Component
 *
 * Modal dialog for entering PIN to authenticate user.
 * Shows/hides PIN and provides visual feedback.
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
import { Eye, EyeOff, Lock } from "lucide-react"
import { toast } from "sonner"

interface PinEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userName: string
  onVerify: (pin: string) => Promise<boolean>
}

export function PinEntryDialog({
  open,
  onOpenChange,
  userName,
  onVerify,
}: PinEntryDialogProps) {
  const [pin, setPin] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (pin.length < 4 || pin.length > 6) {
      toast.error("PIN must be 4-6 digits")
      return
    }

    setIsVerifying(true)
    const isValid = await onVerify(pin)
    setIsVerifying(false)

    if (isValid) {
      toast.success("Access granted!")
      setPin("")
      onOpenChange(false)
    } else {
      toast.error("Incorrect PIN")
      setPin("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-amber-100">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <DialogTitle>Enter PIN</DialogTitle>
          </div>
          <DialogDescription>
            Enter your PIN to view {userName.trim()}'s net worth dashboard
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pin">PIN (4-6 digits)</Label>
            <div className="relative">
              <Input
                id="pin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter your PIN"
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
            <p className="text-xs text-stone-500">
              {pin.length}/6 digits
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPin("")
                onOpenChange(false)
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pin.length < 4 || isVerifying}
              className="flex-1 bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600"
            >
              {isVerifying ? "Verifying..." : "Unlock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
