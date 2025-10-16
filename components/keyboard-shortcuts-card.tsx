"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  { keys: ['?'], description: 'Jump to Settings page', category: 'Quick Actions' },
]

export function KeyboardShortcutsCard() {
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          Keyboard Shortcuts
        </CardTitle>
        <CardDescription className="mt-1.5">
          Navigate Bready more efficiently with these keyboard shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-golden-crust-dark mb-2">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 bg-white/60 backdrop-blur-sm border-2 border-golden-crust-primary/40 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <span className="text-sm text-golden-crust-dark">{shortcut.description}</span>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {shortcut.keys.map((key, keyIndex) => (
                        <kbd
                          key={keyIndex}
                          className="px-2 py-1 text-xs font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded shadow-sm"
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
        </div>
      </CardContent>
    </Card>
  )
}
