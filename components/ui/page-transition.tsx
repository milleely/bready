"use client"

import * as React from "react"
import { motion } from "motion/react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

interface PageTransitionProps {
  children: React.ReactNode
}

/**
 * Page-level entry animation — gentle fade-up applied to <main> contents.
 * Honors prefers-reduced-motion (renders children directly with no motion).
 *
 * One-shot on mount; subsequent re-renders do not re-animate.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <>{children}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      {children}
    </motion.div>
  )
}
