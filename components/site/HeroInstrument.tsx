'use client'

import { motion } from 'framer-motion'

/**
 * HeroInstrument — an animated observatory diagram.
 * Documents flow in from the left, hit the lens (focal point), and emerge as
 * clustered themes on the right. Pure SVG + Framer Motion.
 */
export function HeroInstrument() {
  return (
    <div className="relative w-full aspect-[5/4] md:aspect-[16/10] rounded-3xl overflow-hidden bg-surface border border-border shadow-elev-3">
      {/* Dotted grid */}
      <div className="absolute inset-0 bg-dotgrid opacity-60" />
      {/* Soft amber aurora behind the lens */}
      <div
        className="aurora-glow animate-aurora"
        style={{
          left: '40%',
          top: '30%',
          width: '38%',
          height: '55%',
          background: 'radial-gradient(circle, rgba(232,177,78,0.5), transparent 70%)',
        }}
      />
      <div
        className="aurora-glow animate-aurora-slow"
        style={{
          left: '55%',
          top: '50%',
          width: '32%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(155,123,216,0.35), transparent 70%)',
        }}
      />

      {/* SVG diagram */}
      <svg
        viewBox="0 0 800 500"
        className="absolute inset-0 w-full h-full"
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="flow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E8B14E" stopOpacity="0" />
            <stop offset="50%" stopColor="#E8B14E" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#E8B14E" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="lens" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F5F1E8" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#E8B14E" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#E8B14E" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Source documents (left) */}
        <DocStack x={70} y={120} delay={0} />
        <DocStack x={70} y={220} delay={0.4} />
        <DocStack x={70} y={320} delay={0.8} />

        {/* Flow lines into lens */}
        {[170, 270, 370].map((y, i) => (
          <motion.path
            key={i}
            d={`M 160 ${y} C 280 ${y}, 340 250, 400 250`}
            stroke="url(#flow)"
            strokeWidth="1.25"
            strokeDasharray="3 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0.6] }}
            transition={{
              duration: 1.6,
              delay: 0.6 + i * 0.2,
              repeat: Infinity,
              repeatType: 'loop',
              repeatDelay: 1.8,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Lens / focal instrument */}
        <g>
          <circle cx="400" cy="250" r="90" fill="url(#lens)" />
          <motion.circle
            cx="400"
            cy="250"
            r="70"
            stroke="#E8B14E"
            strokeWidth="1"
            strokeOpacity="0.4"
            animate={{ r: [70, 88, 70], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="400"
            cy="250"
            r="50"
            stroke="#E8B14E"
            strokeWidth="1.25"
            strokeOpacity="0.7"
            animate={{ r: [50, 64, 50], opacity: [0.7, 0.3, 0.7] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          />
          {/* Rotating sight crosshair */}
          <motion.g
            style={{ transformOrigin: '400px 250px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          >
            <line x1="400" y1="180" x2="400" y2="200" stroke="#E8B14E" strokeWidth="1" />
            <line x1="400" y1="300" x2="400" y2="320" stroke="#E8B14E" strokeWidth="1" />
            <line x1="330" y1="250" x2="350" y2="250" stroke="#E8B14E" strokeWidth="1" />
            <line x1="450" y1="250" x2="470" y2="250" stroke="#E8B14E" strokeWidth="1" />
          </motion.g>
          {/* Center focal star */}
          <motion.circle
            cx="400"
            cy="250"
            r="4"
            fill="#F5F1E8"
            animate={{ scale: [1, 1.6, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle cx="400" cy="250" r="1.5" fill="#E8B14E" />
        </g>

        {/* Output flow to themes (right) */}
        {[150, 250, 350].map((y, i) => (
          <motion.path
            key={i}
            d={`M 470 250 C 540 250, 580 ${y}, 660 ${y}`}
            stroke="url(#flow)"
            strokeWidth="1.25"
            strokeDasharray="3 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0.6] }}
            transition={{
              duration: 1.6,
              delay: 1.0 + i * 0.2,
              repeat: Infinity,
              repeatType: 'loop',
              repeatDelay: 1.8,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Theme clusters (right) */}
        <ThemePill x={680} y={140} label="Onboarding friction" count="14" delay={0} />
        <ThemePill x={680} y={240} label="Pricing anxiety" count="11" delay={0.6} />
        <ThemePill x={680} y={340} label="Integration gaps" count="7" delay={1.2} />

        {/* Coordinate labels */}
        <text x="80" y="80" fill="#6E6A63" fontSize="10" fontFamily="monospace">
          SOURCES
        </text>
        <text x="385" y="80" fill="#6E6A63" fontSize="10" fontFamily="monospace" textAnchor="middle">
          LENS · SYNTHESIS
        </text>
        <text x="710" y="80" fill="#6E6A63" fontSize="10" fontFamily="monospace" textAnchor="middle">
          THEMES
        </text>

        {/* Baseline tick marks */}
        <g stroke="#26262B" strokeWidth="1">
          {Array.from({ length: 11 }).map((_, i) => (
            <line key={i} x1={40 + i * 72} y1="475" x2={40 + i * 72} y2="480" />
          ))}
        </g>
        <text x="400" y="495" fill="#6E6A63" fontSize="9" fontFamily="monospace" textAnchor="middle">
          TELESCOPE · OBSERVATORIUM · v0.1
        </text>
      </svg>

      {/* Floating glass cards overlay */}
      <FloatingCard
        className="absolute top-5 left-5"
        title="Interview · SMB"
        meta="4.2 KB"
        delay={0.6}
      />
      <FloatingCard
        className="absolute bottom-5 right-5"
        title="Theme · Pricing anxiety"
        meta="11 insights · 6 quotes"
        delay={1.0}
        accent
      />
      <div className="absolute top-5 right-5 flex items-center gap-2 text-[10px] font-mono text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
        LIVE
      </div>
    </div>
  )
}

function DocStack({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <rect x={x} y={y} width="80" height="60" rx="4" fill="#161619" stroke="#26262B" />
      <rect x={x} y={y} width="80" height="14" rx="4" fill="#1C1C20" />
      <line x1={x + 10} y1={y + 26} x2={x + 60} y2={y + 26} stroke="#3A3A40" strokeWidth="2" />
      <line x1={x + 10} y1={y + 34} x2={x + 56} y2={y + 34} stroke="#2A2A30" strokeWidth="2" />
      <line x1={x + 10} y1={y + 42} x2={x + 50} y2={y + 42} stroke="#2A2A30" strokeWidth="2" />
      <line x1={x + 10} y1={y + 50} x2={x + 58} y2={y + 50} stroke="#2A2A30" strokeWidth="2" />
    </motion.g>
  )
}

function ThemePill({
  x,
  y,
  label,
  count,
  delay,
}: {
  x: number
  y: number
  label: string
  count: string
  delay: number
}) {
  return (
    <motion.g
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <rect x={x - 5} y={y - 16} width="140" height="32" rx="16" fill="#161619" stroke="#26262B" />
      <circle cx={x + 10} cy={y} r="3" fill="#E8B14E" />
      <text x={x + 22} y={y + 1} fill="#F5F1E8" fontSize="11" fontFamily="sans-serif" dominantBaseline="middle">
        {label}
      </text>
      <text x={x + 122} y={y + 1} fill="#E8B14E" fontSize="10" fontFamily="monospace" dominantBaseline="middle" textAnchor="end">
        {count}
      </text>
    </motion.g>
  )
}

function FloatingCard({
  className,
  title,
  meta,
  delay,
  accent,
}: {
  className?: string
  title: string
  meta: string
  delay: number
  accent?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`${className} px-3.5 py-2.5 rounded-xl bg-background/60 backdrop-blur-md border border-border/80 shadow-elev-1`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            accent ? 'bg-accent' : 'bg-success'
          } animate-pulse-subtle`}
        />
        <span className="text-[11px] font-medium text-text-primary">{title}</span>
      </div>
      <p className="text-[10px] text-text-muted font-mono mt-1 pl-3.5">{meta}</p>
    </motion.div>
  )
}