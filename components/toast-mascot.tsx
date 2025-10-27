export function ToastMascot({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Bready the Toast Mascot"
    >
      {/* Layer 1: Ground shadow */}
      <ellipse cx="110" cy="220" rx="35" ry="8" fill="#000000" opacity="0.15" />

      {/* Layer 2: Legs */}
      <g stroke="#92400e" strokeWidth="5" strokeLinecap="round">
        <line x1="90" y1="165" x2="85" y2="210" />
        <line x1="130" y1="165" x2="135" y2="210" />
      </g>

      {/* Layer 3: Side crust (right edge - creates depth) */}
      <path
        d="M 150 55 L 170 60 L 165 165 L 145 160 Z"
        fill="#d97706"
        stroke="#92400e"
        strokeWidth="2"
      />

      {/* Layer 4: Top crust (horizontal edge) */}
      <path
        d="M 70 60 L 150 55 L 170 60 L 90 65 Z"
        fill="#f59e0b"
        stroke="#92400e"
        strokeWidth="1.5"
      />

      {/* Layer 5: Front face (main toast surface) */}
      <path
        d="M 70 60 L 150 55 L 145 160 L 75 165 Z"
        fill="#fde68a"
        stroke="#92400e"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Layer 6: Bread texture dots */}
      <g fill="#f59e0b" opacity="0.4">
        {/* Top section */}
        <circle cx="85" cy="70" r="2.5" />
        <circle cx="110" cy="68" r="3" />
        <circle cx="135" cy="72" r="2" />

        {/* Middle-left section */}
        <circle cx="80" cy="90" r="3.5" />
        <circle cx="92" cy="85" r="2" />
        <circle cx="88" cy="105" r="2.5" />

        {/* Middle-right section */}
        <circle cx="125" cy="88" r="3" />
        <circle cx="138" cy="95" r="2.5" />
        <circle cx="130" cy="108" r="2" />

        {/* Lower section */}
        <circle cx="95" cy="140" r="3.5" />
        <circle cx="115" cy="138" r="2.5" />
        <circle cx="105" cy="150" r="2" />
        <circle cx="85" cy="145" r="3" />
        <circle cx="125" cy="145" r="2.5" />
        <circle cx="140" cy="130" r="2" />

        {/* Scattered details */}
        <circle cx="100" cy="115" r="2" />
        <circle cx="120" cy="120" r="2.5" />
        <circle cx="90" cy="128" r="2" />
      </g>

      {/* Layer 7: Arms */}
      <g stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" fill="none">
        {/* Left arm (on hip) */}
        <path d="M 75 110 Q 60 115, 62 125" />

        {/* Right arm (waving) */}
        <path d="M 145 100 Q 165 95, 175 85" />
      </g>

      {/* Hands for definition */}
      <circle cx="62" cy="125" r="6" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />
      <circle cx="175" cy="85" r="6" fill="#f59e0b" stroke="#92400e" strokeWidth="2" />

      {/* Layer 8: Facial features */}
      {/* Eyes */}
      <ellipse cx="95" cy="100" rx="5" ry="3.5" fill="#92400e" />
      <ellipse cx="120" cy="98" rx="5" ry="3.5" fill="#92400e" />

      {/* Blush */}
      <g stroke="#fca5a5" strokeWidth="1.5" strokeLinecap="round">
        {/* Left blush */}
        <line x1="80" y1="115" x2="88" y2="115" />
        <line x1="81" y1="120" x2="87" y2="120" />

        {/* Right blush */}
        <line x1="127" y1="113" x2="135" y2="113" />
        <line x1="128" y1="118" x2="134" y2="118" />
      </g>

      {/* Mouth */}
      <path
        d="M 95 125 Q 100 130, 107.5 125 Q 115 130, 120 125"
        stroke="#92400e"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
