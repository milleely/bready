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
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#breadGradient)"
        opacity="0.1"
      />

      {/* Main bread shape */}
      <path
        d="M 25 50
           Q 25 30, 50 30
           T 75 50
           Q 75 70, 50 70
           T 25 50"
        fill="url(#crustGradient)"
        stroke="url(#outlineGradient)"
        strokeWidth="2.5"
      />

      {/* Bread scoring marks */}
      <path
        d="M 35 40 Q 40 45, 35 50"
        stroke="#b45309"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 50 38 Q 50 45, 50 52"
        stroke="#b45309"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M 65 40 Q 60 45, 65 50"
        stroke="#b45309"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Steam effects */}
      <g className={animate ? "animate-pulse" : ""}>
        <path
          d="M 40 25 Q 42 20, 40 15"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <path
          d="M 50 23 Q 52 18, 50 13"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M 60 25 Q 58 20, 60 15"
          stroke="#f59e0b"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
      </g>

      {/* Highlight for glossy effect */}
      <ellipse
        cx="50"
        cy="40"
        rx="15"
        ry="8"
        fill="white"
        opacity="0.3"
      />

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="breadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>

        <linearGradient id="crustGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="30%" stopColor="#d97706" />
          <stop offset="70%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>

        <linearGradient id="outlineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {/* Shadow filter */}
        <filter id="shadow">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2"/>
        </filter>
      </defs>

      {/* Apply shadow to the whole logo */}
      <style>{`
        svg {
          filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.15));
        }
      `}</style>
    </svg>
  )
}