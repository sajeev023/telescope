'use client'

import { Users, Building2, User, Quote } from 'lucide-react'
import type { SegmentBreakdown as SegmentBreakdownType, Segment } from '@/types/report'
import { getSegmentColor } from '@/lib/data'
import { SectionHeading, hexAlpha } from './SegmentBadge'

const SEGMENT_META: Record<
  Segment,
  { label: string; icon: React.ReactNode }
> = {
  smb: {
    label: 'SMB',
    icon: <Users className="w-5 h-5" />,
  },
  enterprise: {
    label: 'Enterprise',
    icon: <Building2 className="w-5 h-5" />,
  },
  freelancer: {
    label: 'Freelancer',
    icon: <User className="w-5 h-5" />,
  },
}

export function SegmentBreakdown({
  breakdown,
}: {
  breakdown: SegmentBreakdownType
}) {
  const segments: Segment[] = ['smb', 'enterprise', 'freelancer']
  return (
    <section className="mb-16">
      <SectionHeading icon={<Users className="w-4 h-4" />} label="Segment Breakdown" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {segments.map((s) => {
          const profile = breakdown[s]
          const color = getSegmentColor(s)
          const meta = SEGMENT_META[s]
          return (
            <div
              key={s}
              className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/20 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    color,
                    backgroundColor: hexAlpha(color, 0.18),
                  }}
                >
                  {meta.icon}
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ color }}
                >
                  {meta.label}
                </h3>
              </div>
              <div className="mb-4">
                <p className="text-[11px] uppercase tracking-wider text-text-muted mb-1">
                  Top concern
                </p>
                <p className="text-sm text-text-primary font-medium">
                  {profile.top_concern}
                </p>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                {profile.summary}
              </p>
              <div className="border-l-2 pl-3" style={{ borderColor: hexAlpha(color, 0.5) }}>
                <Quote className="w-4 h-4 mb-1" style={{ color }} />
                <p className="text-sm italic text-text-primary leading-relaxed">
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