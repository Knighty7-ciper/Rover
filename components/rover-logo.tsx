export function RoverLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Speech bubble with government building */}
      <rect x="15" y="10" width="70" height="60" rx="8" fill="currentColor" />
      {/* Pointer */}
      <path d="M25 70 L15 85 L40 70" fill="currentColor" />
      {/* Building roof */}
      <path d="M30 30 L50 18 L70 30" stroke="#F5F3EE" strokeWidth="3" fill="none" />
      {/* Building base line */}
      <line x1="30" y1="30" x2="70" y2="30" stroke="#F5F3EE" strokeWidth="3" />
      {/* Pillars */}
      <line x1="35" y1="30" x2="35" y2="55" stroke="#F5F3EE" strokeWidth="4" />
      <line x1="50" y1="30" x2="50" y2="55" stroke="#F5F3EE" strokeWidth="4" />
      <line x1="65" y1="30" x2="65" y2="55" stroke="#F5F3EE" strokeWidth="4" />
      {/* Base */}
      <line x1="28" y1="55" x2="72" y2="55" stroke="#F5F3EE" strokeWidth="3" />
    </svg>
  )
}
