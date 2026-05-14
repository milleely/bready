"use client"

import { useReducedMotion as useMotionReducedMotion } from "motion/react"

/**
 * Thin wrapper around motion's useReducedMotion so every animated primitive
 * reads from one place. Returns `true` when the user has requested reduced
 * motion via OS settings.
 *
 * Use in motion components:
 *   const reduced = useReducedMotion()
 *   <motion.div animate={reduced ? {} : { y: 0 }} />
 */
export function useReducedMotion(): boolean {
  return useMotionReducedMotion() ?? false
}
