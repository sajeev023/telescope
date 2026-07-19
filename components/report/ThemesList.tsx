'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ChevronDown, Quote, ChevronsUpDown } from 'lucide-react'
import type { Theme } from '@/types/report'
import { SectionHeading, SeverityBadge, SegmentBadge } from './SegmentBadge'
import { EmptyState } from './EmptyState'

export function ThemesList({
  themes,
  onQuoteClick,
}: {
  themes: Theme[]
  onQuoteClick?: (q: { quote: string; source: string; segment: string }) => void
}) {
  const [open, setOpen] = useState<number | null>(0)

  const allExpanded = open === -1 || (themes.length > 0 && themes.every((_, i) => open === i))
  const itemOpen = (i: number) => open === i || open === -1

  const toggleAll = () => {
    if (allExpanded) setOpen(null)
    else setOpen(-1)
  }

  return (
    <section className="mb-16">
      <div className="flex items-baseline justify-between mb-5">
        <SectionHeading
          icon={<Layers className="w-4 h-4" />}
          label="Themes"
          index="05"
        />
        {themes.length > 0 && (
          <button
            type="button"
            onClick={toggleAll}
            className="text-[10px] text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1 font-mono uppercase tracking-editorial-wide"
          >
            <ChevronsUpDown className="w-3 h-3" />
            {allExpanded ? 'Collapse all' : 'Expand all'}
          </button>
        )}
      </div>
      {themes.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-5 h-5" />}
          title="No themes identified"
          description="Not enough evidence was found to cluster insights into themes."
        />
      ) : (
        <div className="space-y-3">
          {themes.map((theme, i) => {
            const expanded = itemOpen(i)
            return (
              <div
                key={theme.name}
                className="card hover:border-accent/30 transition-colors overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : i)}
                  className="w-full flex items-center gap-4 px-6 py-5 text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h3 className="text-base font-medium text-text-primary">
                        {theme.name}
                      </h3>
                      <SeverityBadge severity={theme.severity} />
                      <span className="text-xs text-text-muted font-mono">
                        {theme.insight_count} insights
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {theme.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {theme.affected_segments.map((s) => (
                        <SegmentBadge key={s} segment={s} />
                      ))}
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: expanded ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-shrink-0 w-8 h-8 rounded-full border border-border bg-surface-raised flex items-center justify-center text-text-secondary group-hover:text-accent group-hover:border-accent/30 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-3 border-t border-border">
                        <div className="space-y-3 mb-5">
                          <p className="text-[10px] uppercase tracking-editorial-wide text-text-muted">
                            Key quotes
                          </p>
                          {theme.key_quotes.map((q, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => onQuoteClick?.(q)}
                              className="block w-full text-left border-l-2 border-accent/40 pl-3.5 py-1 rounded-md hover:bg-surface-raised transition-colors"
                            >
                              <p className="text-sm italic text-text-primary leading-relaxed flex gap-1.5 font-serif">
                                <Quote className="w-3 h-3 mt-1 flex-shrink-0 text-accent/60" />
                                {q.quote}
                              </p>
                              <p className="text-xs text-text-muted mt-1.5 font-mono">
                                — {q.source}
                              </p>
                            </button>
                          ))}
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-editorial-wide text-text-muted mb-1">
                            Interpretation
                          </p>
                          <p className="text-sm text-text-secondary leading-relaxed">
                            {theme.interpretation}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}