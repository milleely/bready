import { useEffect } from 'react'

interface ShortcutOptions {
  key: string
  ctrlOrCmd?: boolean
  shift?: boolean
  alt?: boolean
  preventDefault?: boolean
}

export function useKeyboardShortcut(
  options: ShortcutOptions,
  callback: () => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === options.key.toLowerCase()
      const matchesCtrlOrCmd = options.ctrlOrCmd ? (e.ctrlKey || e.metaKey) : true
      const matchesShift = options.shift !== undefined ? e.shiftKey === options.shift : true
      const matchesAlt = options.alt !== undefined ? e.altKey === options.alt : true

      if (matchesKey && matchesCtrlOrCmd && matchesShift && matchesAlt) {
        if (options.preventDefault) {
          e.preventDefault()
        }
        callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [options.key, options.ctrlOrCmd, options.shift, options.alt, callback, enabled])
}
