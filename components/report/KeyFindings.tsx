'use client'

import { Trophy } from 'lucide-react'
import type { KeyFinding } from '@/types/report'
import { SectionHeading, SeverityBadge, SegmentBadge } from './SegmentBadge'

export function KeyFindings({ findings }: { findings: KeyFinding[] }) {
  return (
    <section className="mb-16">
      <SectionHeading icon={<Trophy className="w-4 h-4" />} label="Key Findings" />
      <div className="space-y-3">
        {findings.map((f) => (
          <div
            key={f.rank}
            className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/20 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-lg">
                {f.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-semibold text-text-primary">
                    {f.finding}
                  </h3>
                  <SeverityBadge severity={f.severity} />
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  {f.evidence}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {f.affected_segments.map((s) => (
                    <SegmentBadge key={s} segment={s} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}