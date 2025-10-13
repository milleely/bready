"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReceiptLightboxProps {
  receiptUrl: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReceiptLightbox({ receiptUrl, open, onOpenChange }: ReceiptLightboxProps) {
  if (!receiptUrl) return null

  const isPdf = receiptUrl.toLowerCase().endsWith('.pdf')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <div className="relative w-full h-[80vh] bg-black/90">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Receipt content */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {isPdf ? (
              <iframe
                src={receiptUrl}
                className="w-full h-full border-0"
                title="Receipt PDF"
              />
            ) : (
              <img
                src={receiptUrl}
                alt="Receipt"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
