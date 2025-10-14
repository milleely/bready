"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

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
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden [&>button]:flex [&>button]:items-center [&>button]:justify-center [&>button]:text-white [&>button]:bg-black/50 [&>button]:hover:bg-black/70 [&>button]:rounded-full [&>button]:h-8 [&>button]:w-8 [&>button]:p-0">
        <VisuallyHidden>
          <DialogTitle>Receipt Preview</DialogTitle>
        </VisuallyHidden>
        <div className="relative w-full h-[80vh] bg-black/90">
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
