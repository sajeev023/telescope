'use client'

import { MessageSquare } from 'lucide-react'
import type { NotableQuote as NotableQuoteType } from '@/types/report'
import { SectionHeading, SegmentBadge } from './SegmentBadge'

export function NotableQuotes({
  quotes,
}: {
  quotes: NotableQuoteType[]
}) {
  return (
    <section className="mb-16">
      <SectionHeading icon={<MessageSquare className="w-4 h-4" />} label="Notable Quotes" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotes.map((q, i) => (
          <div
            key={i}
            className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/20 transition-colors relative"
          >
            <span className="absolute top-3 right-4 text-5xl leading-none text-accent/30 font-serif select-none">
              &ldquo;
            </span>
            <p className="text-sm italic text-text-primary leading-relaxed mb-4 pr-6">
              {q.quote}
            </p>
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  {q.speaker}
                </p>
                <p className="text-xs text-text-muted mt-0.5">{q.context}</p>
              </div>
              <SegmentBadge segment={q.segment} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}