'use client'

import { ListChecks, ArrowRight } from 'lucide-react'
import type { Recommendation } from '@/types/report'
import { SectionHeading, EffortBadge, SegmentBadge } from './SegmentBadge'

export function Recommendations({
  recommendations,
}: {
  recommendations: Recommendation[]
}) {
  return (
    <section className="mb-16">
      <SectionHeading icon={<ListChecks className="w-4 h-4" />} label="Recommendations" />
      <div className="space-y-3">
        {recommendations.map((r) => (
          <div
            key={r.rank}
            className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/20 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent text-white flex items-center justify-center font-bold text-lg">
                {r.rank}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-text-primary mb-2">
                  {r.action}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed mb-3">
                  {r.rationale}
                </p>
                <div className="flex items-start gap-2 mb-3">
                  <ArrowRight className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                  <p className="text-sm text-text-primary">
                    <span className="text-text-secondary">Expected impact: </span>
                    {r.expected_impact}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {r.target_segment === 'all' ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-border text-text-secondary bg-surface-raised">
                      All segments
                    </span>
                  ) : (
                    <SegmentBadge segment={r.target_segment} />
                  )}
                  <EffortBadge effort={r.effort_estimate} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}