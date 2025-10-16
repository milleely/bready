"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Lightweight component that handles keyboard shortcuts for navigation.
 * Press '?' to navigate to the Settings page where shortcuts are displayed.
 */
export function KeyboardShortcutsNavigation() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Navigate to settings with ? key (Shift + /)
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        router.push('/settings')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // This component doesn't render anything
  return null
}
