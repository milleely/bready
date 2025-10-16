"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Keyboard } from "lucide-react"

interface Shortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['Tab'], description: 'Navigate to next interactive element', category: 'Navigation' },
  { keys: ['Shift', 'Tab'], description: 'Navigate to previous interactive element', category: 'Navigation' },
  { keys: ['Enter'], description: 'Activate focused button or link', category: 'Navigation' },
  { keys: ['Space'], description: 'Activate focused button or checkbox', category: 'Navigation' },
  { keys: ['Escape'], description: 'Close open dialog or modal', category: 'Navigation' },

  // Quick Actions
  { keys: ['?'], description: 'Open keyboard shortcuts help', category: 'Quick Actions' },
]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open dialog with ? key (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-lg transition-all duration-200 hover:scale-105"
        aria-label="Open keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
        <span className="text-sm font-medium">Shortcuts</span>
        <Badge variant="secondary" className="bg-amber-800 text-white text-xs">
          ?
        </Badge>
      </button>

      {/* Shortcuts dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-900">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Navigate Bready more efficiently with these keyboard shortcuts
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-amber-900 mb-3">{category}</h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-amber-50 rounded-md hover:bg-amber-100 transition-colors"
                    >
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 text-xs font-semibold text-amber-900 bg-white border border-amber-300 rounded shadow-sm"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-amber-200">
              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-2 py-1 text-xs font-semibold text-amber-900 bg-white border border-amber-300 rounded">?</kbd> anytime to view this help
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
