'use client'

import { ListChecks, ArrowRight } from 'lucide-react'
import type { Recommendation } from '@/types/report'
import { SectionHeading, EffortBadge, SegmentBadge } from './SegmentBadge'
import { EmptyState } from './EmptyState'

export function Recommendations({
  recommendations,
}: {
  recommendations: Recommendation[]
}) {
  return (
    <section className="mb-16">
      <SectionHeading
        icon={<ListChecks className="w-4 h-4" />}
        label="Recommendations"
        index="06"
      />
      {recommendations.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="w-5 h-5" />}
          title="No recommendations"
          description="Not enough evidence was found to generate actionable recommendations."
        />
      ) : (
        <div className="space-y-3">
          {recommendations.map((r) => (
            <div
              key={r.rank}
              className="card p-6 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-surface-raised border border-border text-text-primary flex items-center justify-center font-serif text-xl group-hover:border-accent/40 group-hover:text-accent transition-colors">
                  {r.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-medium text-text-primary mb-2.5 leading-snug">
                    {r.action}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3.5">
                    {r.rationale}
                  </p>
                  <div className="flex items-start gap-2 mb-3.5 px-3 py-2.5 rounded-lg bg-surface-raised border border-border">
                    <ArrowRight className="w-4 h-4 mt-0.5 text-accent flex-shrink-0" />
                    <p className="text-sm text-text-primary">
                      <span className="text-text-secondary">Expected impact · </span>
                      {r.expected_impact}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {r.target_segment === 'all' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-text-secondary bg-surface-raised uppercase tracking-editorial-wide">
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
      )}
    </section>
  )
}