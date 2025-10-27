"use client"

/**
 * Toast Mascot Component - Friendly Minimalist Design
 *
 * A warm, appetizing toast character with clear friendly face.
 * Simple, static design focused on delightful aesthetics.
 */

export function ToastMascot() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {/* Toast Character - Static */}
      <div className="relative mb-6">
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="toast-mascot-friendly"
          role="img"
          aria-label="Toasty, your friendly financial assistant mascot"
        >
          <title>Toasty the Toast Mascot</title>
          <desc>A cheerful toast character with a warm, appetizing design</desc>

          {/* No filters needed for flat design */}
          <defs></defs>

          {/* ===== TOP HAT ===== */}
          {/* Hat brim */}
          <ellipse cx="80" cy="18" rx="22" ry="6" fill="#1f2937" stroke="#374151" strokeWidth="1" />

          {/* Hat body */}
          <rect x="68" y="2" width="24" height="16" rx="3" fill="#1f2937" />

          {/* Hat top */}
          <ellipse cx="80" cy="2" rx="12" ry="4" fill="#374151" />

          {/* Hat band (accent stripe) */}
          <rect x="68" y="14" width="24" height="2" fill="#6b7280" opacity="0.6" />

          {/* ===== GROUND SHADOW ===== */}
          <ellipse cx="80" cy="145" rx="40" ry="6" fill="#000000" opacity="0.1" />

          {/* ===== MAIN TOAST BODY (3-Layer System) ===== */}
          {/* Layer 1: Outer crust (dark border) */}
          <rect
            x="25"
            y="20"
            width="110"
            height="110"
            rx="20"
            fill="#92400e"
          />

          {/* Layer 2: Inner toast body (golden flat color) */}
          <rect
            x="31"
            y="26"
            width="98"
            height="98"
            rx="16"
            fill="#fbbf24"
          />

          {/* Layer 3: Center highlight (lighter bread interior) */}
          <rect
            x="40"
            y="35"
            width="80"
            height="80"
            rx="12"
            fill="#fde68a"
            opacity="0.35"
          />

          {/* ===== BREAD TEXTURE (Simplified Pores) ===== */}
          <g opacity="0.15">
            <circle cx="50" cy="45" r="2.5" fill="#92400e" />
            <circle cx="70" cy="38" r="2" fill="#92400e" />
            <circle cx="90" cy="50" r="3" fill="#92400e" />
            <circle cx="60" cy="70" r="2.5" fill="#92400e" />
            <circle cx="100" cy="75" r="2" fill="#92400e" />
            <circle cx="45" cy="90" r="2.5" fill="#92400e" />
            <circle cx="85" cy="100" r="3" fill="#92400e" />
            <circle cx="65" cy="115" r="2" fill="#92400e" />
            <circle cx="110" cy="105" r="2.5" fill="#92400e" />
          </g>


          {/* ===== FRIENDLY FACE ===== */}
          {/* Left Eye */}
          <circle cx="60" cy="65" r="7" fill="#92400e" />

          {/* Right Eye */}
          <circle cx="100" cy="65" r="7" fill="#92400e" />

          {/* Smile */}
          <path
            d="M 55 85 Q 80 95 105 85"
            stroke="#92400e"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Speech Bubble */}
      <div className="relative max-w-md">
        {/* Bubble Tail */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-amber-100" />

        {/* Bubble Content */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 rounded-2xl px-6 py-4 shadow-lg">
          <p className="text-center text-lg font-medium text-stone-800">
            Hi! I'm <span className="text-amber-700 font-bold">Toasty</span>, your financial assistant 🍞
          </p>
          <p className="text-center text-sm text-stone-600 mt-1">
            Ask me anything about your spending habits!
          </p>
        </div>
      </div>
    </div>
  )
}
