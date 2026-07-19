'use client'

import { Users, Building2, User, Quote } from 'lucide-react'
import type { SegmentBreakdown as SegmentBreakdownType, Segment } from '@/types/report'
import { getSegmentColor } from '@/lib/data'
import { SectionHeading, hexAlpha } from './SegmentBadge'

const SEGMENT_META: Record<
  Segment,
  { label: string; icon: React.ReactNode }
> = {
  smb: { label: 'SMB', icon: <Users className="w-5 h-5" /> },
  enterprise: { label: 'Enterprise', icon: <Building2 className="w-5 h-5" /> },
  freelancer: { label: 'Freelancer', icon: <User className="w-5 h-5" /> },
  general: { label: 'General', icon: <Users className="w-5 h-5" /> },
}

export function SegmentBreakdown({
  breakdown,
}: {
  breakdown: SegmentBreakdownType
}) {
  const segments: Segment[] = ['smb', 'enterprise', 'freelancer']
  const visible = segments.filter((s) => breakdown[s])
  return (
    <section className="mb-16">
      <SectionHeading
        icon={<Users className="w-4 h-4" />}
        label="Segment Breakdown"
        index="03"
      />
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.max(visible.length, 1)}, minmax(0, 1fr))` }}
      >
        {segments.map((s) => {
          const profile = breakdown[s]
          if (!profile) return null
          const color = getSegmentColor(s)
          const meta = SEGMENT_META[s]
          return (
            <div
              key={s}
              className="card p-6 hover:border-accent/30 transition-colors relative overflow-hidden"
            >
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl pointer-events-none"
                style={{ backgroundColor: hexAlpha(color, 0.08) }}
              />
              <div className="flex items-center gap-3 mb-5 relative">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border"
                  style={{
                    color,
                    backgroundColor: hexAlpha(color, 0.12),
                    borderColor: hexAlpha(color, 0.28),
                  }}
                >
                  {meta.icon}
                </div>
                <div>
                  <h3
                    className="text-lg font-medium"
                    style={{ color }}
                  >
                    {meta.label}
                  </h3>
                  <p className="text-[10px] uppercase tracking-editorial-wide text-text-muted">
                    Segment
                  </p>
                </div>
              </div>
              <div className="mb-4 relative">
                <p className="text-[10px] uppercase tracking-editorial-wide text-text-muted mb-1.5">
                  Top concern
                </p>
                <p className="text-sm text-text-primary font-medium leading-snug">
                  {profile.top_concern}
                </p>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4 relative">
                {profile.summary}
              </p>
              <div
                className="border-l-2 pl-3 relative"
                style={{ borderColor: hexAlpha(color, 0.5) }}
              >
                <Quote className="w-4 h-4 mb-1" style={{ color }} />
                <p className="text-sm italic text-text-primary leading-relaxed font-serif">
                  {profile.key_quote}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}