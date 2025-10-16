"use client"

import { cn } from "@/lib/utils"

interface BreadyLogoProps {
  size?: number
  className?: string
  animate?: boolean
}

export function BreadyLogo({ size = 48, className, animate = true }: BreadyLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        animate && "hover:scale-110 transition-transform duration-300",
        className
      )}
      aria-label="Bready logo"
    >
      {/* Main bread slice body */}
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        rx="8"
        fill="#f59e0b"
      />

      {/* Crust border - darker amber */}
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        rx="8"
        stroke="#b45309"
        strokeWidth="6"
        fill="none"
      />

      {/* Inner lighter area (bread texture) */}
      <rect
        x="30"
        y="30"
        width="40"
        height="40"
        rx="4"
        fill="#fde68a"
        opacity="0.6"
      />

      {/* Texture pattern - diamond grid */}
      <g stroke="#d97706" strokeWidth="3" strokeLinecap="round">
        {/* Diagonal lines creating diamond pattern */}
        <line x1="35" y1="40" x2="45" y2="50" />
        <line x1="45" y1="40" x2="55" y2="50" />
        <line x1="55" y1="40" x2="65" y2="50" />

        <line x1="35" y1="50" x2="45" y2="60" />
        <line x1="45" y1="50" x2="55" y2="60" />
        <line x1="55" y1="50" x2="65" y2="60" />

        <line x1="40" y1="35" x2="50" y2="45" />
        <line x1="50" y1="35" x2="60" y2="45" />

        <line x1="40" y1="55" x2="50" y2="65" />
        <line x1="50" y1="55" x2="60" y2="65" />
      </g>

      {/* Corner highlights for dimension */}
      <circle cx="32" cy="32" r="4" fill="#fbbf24" opacity="0.5" />
      <circle cx="68" cy="32" r="4" fill="#fbbf24" opacity="0.5" />

      {/* Strong outer border for maximum contrast */}
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        rx="8"
        stroke="#92400e"
        strokeWidth="3"
        fill="none"
      />
    </svg>
  )
}
