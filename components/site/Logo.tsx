'use client'

export function TelescopeMark({ className = 'w-7 h-7' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* Outer ring — observational orbit */}
      <circle
        cx="16"
        cy="16"
        r="13.5"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.25"
      />
      {/* Telescope lens — focal point */}
      <circle cx="16" cy="16" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      {/* Light path / crosshair */}
      <path
        d="M16 2.5v3M16 26.5v3M2.5 16h3M26.5 16h3"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      {/* Focal star — the accent */}
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      {/* Sight angle tick */}
      <path
        d="M24.5 7.5l-2 2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-serif text-[1.35rem] leading-none tracking-editorial-tight ${className}`}>
      Telescope
    </span>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 text-text-primary ${className}`}>
      <span className="text-accent">
        <TelescopeMark />
      </span>
      <Wordmark />
    </span>
  )
}