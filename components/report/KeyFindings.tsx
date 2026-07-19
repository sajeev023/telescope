'use client'

import { useState } from 'react'
import { Trophy, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import type { KeyFinding } from '@/types/report'
import { SectionHeading, SeverityBadge, SegmentBadge } from './SegmentBadge'
import { EmptyState } from './EmptyState'

export function KeyFindings({
  findings,
  onSourceClick,
}: {
  findings: KeyFinding[]
  onSourceClick?: (source: string) => void
}) {
  const [expandedSources, setExpandedSources] = useState<Record<number, boolean>>({})

  const toggleSources = (rank: number) => {
    setExpandedSources((prev) => ({ ...prev, [rank]: !prev[rank] }))
  }

  return (
    <section className="mb-16">
      <SectionHeading
        icon={<Trophy className="w-4 h-4" />}
        label="Key Findings"
        index="02"
      />
      {findings.length === 0 ? (
        <EmptyState
          icon={<Trophy className="w-5 h-5" />}
          title="No key findings"
          description="Not enough evidence was found to generate key findings from the provided documents."
        />
      ) : (
        <div className="space-y-3">
          {findings.map((f) => (
            <div
              key={f.rank}
              className="card p-6 hover:border-accent/30 transition-colors group"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-surface-raised border border-border text-text-primary flex items-center justify-center font-serif text-xl group-hover:border-accent/40 group-hover:text-accent transition-colors">
                  {f.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h3 className="text-base font-medium text-text-primary leading-snug">
                      {f.finding}
                    </h3>
                    <SeverityBadge severity={f.severity} />
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3.5">
                    {f.evidence}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {f.affected_segments.map((s) => (
                      <SegmentBadge key={s} segment={s} />
                    ))}
                    {f.sources && f.sources.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleSources(f.rank)}
                        className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-border bg-surface-raised text-text-secondary hover:text-accent hover:border-accent/30 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        {f.sources.length}{' '}
                        {f.sources.length === 1 ? 'source' : 'sources'}
                        {expandedSources[f.rank] ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                  {expandedSources[f.rank] && f.sources && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-text-muted uppercase tracking-editorial-wide mb-2">
                        Source Documents
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.sources.map((src) => (
                          <button
                            key={src}
                            type="button"
                            onClick={() => onSourceClick?.(src)}
                            className="text-xs px-2 py-0.5 rounded-md bg-background border border-border text-text-secondary font-mono hover:text-accent hover:border-accent/30 transition-colors"
                          >
                            {src}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}