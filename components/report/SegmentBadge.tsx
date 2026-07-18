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
        : 'Freelancer'
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{
        color,
        backgroundColor: hexAlpha(color, 0.18),
        borderColor: hexAlpha(color, 0.3),
      }}
    >
      {label}
    </span>
  )
}

export function SeverityBadge({ severity }: { severity: Severity }) {
  const color = getSeverityColor(severity)
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wide border"
      style={{
        color,
        backgroundColor: hexAlpha(color, 0.18),
        borderColor: hexAlpha(color, 0.3),
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
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wide border"
      style={{
        color,
        backgroundColor: hexAlpha(color, 0.18),
        borderColor: hexAlpha(color, 0.3),
      }}
    >
      {effort} effort
    </span>
  )
}

export function SectionHeading({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-text-secondary">{icon}</span>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
        {label}
      </h2>
    </div>
  )
}

export { hexAlpha }