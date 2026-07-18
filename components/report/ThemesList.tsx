'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers, ChevronDown, Quote } from 'lucide-react'
import type { Theme } from '@/types/report'
import { SectionHeading, SeverityBadge, SegmentBadge } from './SegmentBadge'

export function ThemesList({ themes }: { themes: Theme[] }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="mb-16">
      <SectionHeading icon={<Layers className="w-4 h-4" />} label="Themes" />
      <div className="space-y-3">
        {themes.map((theme, i) => {
          const isOpen = open === i
          return (
            <div
              key={theme.name}
              className="rounded-2xl bg-surface border border-border hover:border-accent/20 transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-4 px-6 py-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-base font-semibold text-text-primary">
                      {theme.name}
                    </h3>
                    <SeverityBadge severity={theme.severity} />
                    <span className="text-xs text-text-muted">
                      {theme.insight_count} insights
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {theme.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {theme.affected_segments.map((s) => (
                      <SegmentBadge key={s} segment={s} />
                    ))}
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0 text-text-secondary"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-border">
                      <div className="space-y-3 mb-4">
                        <p className="text-xs uppercase tracking-wider text-text-muted">
                          Key quotes
                        </p>
                        {theme.key_quotes.map((q, idx) => (
                          <div
                            key={idx}
                            className="border-l-2 border-accent/40 pl-3"
                          >
                            <p className="text-sm italic text-text-primary leading-relaxed flex gap-1.5">
                              <Quote className="w-3 h-3 mt-1 flex-shrink-0 text-accent/60" />
                              {q.quote}
                            </p>
                            <p className="text-xs text-text-muted mt-1">
                              — {q.source}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-text-muted mb-1">
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
    </section>
  )
}