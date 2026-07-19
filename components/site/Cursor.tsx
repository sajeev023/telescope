'use client'

import { useEffect, useState } from 'react'

/**
 * Soft amber spotlight that follows the cursor — only on devices with a
 * fine pointer. Subtle, low-opacity. Used in hero only.
 */
export function CursorSpotlight() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(pointer: fine)')
    if (!mq.matches) return
    setEnabled(true)
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  if (!enabled) return null
  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(232,177,78,0.06), transparent 70%)`,
      }}
      aria-hidden
    />
  )
}