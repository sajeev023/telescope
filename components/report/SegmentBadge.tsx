'use client'

import { getSegmentColor, getSeverityColor, getEffortColor } from '@/lib/data'
import type { Segment, Severity, Effort } from '@/types/report'

function hexAlpha(hex: string, alpha: number) {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${a}`
}

export function SegmentBadge({ segment }: { segment: Segment }) {
  const color = getSegmentColor(segment)
  const label =
    segment === 'smb'
      ? 'SMB'
      : segment === 'enterprise'
        ? 'Enterprise'
        : segment === 'freelancer'
          ? 'Freelancer'
          : 'General'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{
        color,
        backgroundColor: hexAlpha(color, 0.14),
        borderColor: hexAlpha(color, 0.28),
      }}
    >
      <span
        className="w-1 h-1 rounded-full mr-1.5"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const color = getSeverityColor(severity)
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-editorial-wide border"
      style={{
        color,
        backgroundColor: hexAlpha(color, 0.12),
        borderColor: hexAlpha(color, 0.28),
      }}
    >
      {severity}
    </span>
  )
}

export function EffortBadge({ effort }: { effort: Effort }) {
  const color = getEffortColor(effort)
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-editorial-wide border"
      style={{
        color,
        backgroundColor: hexAlpha(color, 0.12),
        borderColor: hexAlpha(color, 0.28),
      }}
    >
      {effort} effort
    </span>
  )
}

export function SectionHeading({
  icon,
  label,
  index,
}: {
  icon: React.ReactNode
  label: string
  index?: string
}) {
  return (
    <div className="flex items-baseline justify-between mb-5">
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-secondary">
          {icon}
        </span>
        <h2 className="text-xs font-semibold uppercase tracking-editorial-wide text-text-secondary">
          {label}
        </h2>
      </div>
      {index && (
        <span className="text-[10px] font-mono text-text-muted">{index}</span>
      )}
    </div>
  )
}

export { hexAlpha }