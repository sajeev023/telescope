'use client'

import { Lightbulb, Quote } from 'lucide-react'
import { SectionHeading } from './SegmentBadge'
import { EmptyState } from './EmptyState'

export function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <section className="mb-16">
      <SectionHeading
        icon={<Lightbulb className="w-4 h-4" />}
        label="Executive Summary"
        index="01"
      />
      {!summary || summary.trim().length === 0 ? (
        <EmptyState
          icon={<Lightbulb className="w-5 h-5" />}
          title="No executive summary available"
          description="The AI was unable to generate a summary from the provided documents."
        />
      ) : (
        <div className="card-raised p-7 lg:p-9 relative overflow-hidden gradient-border">
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
          <Quote className="w-8 h-8 text-accent/30 mb-5" />
          <p className="relative text-xl leading-relaxed text-text-primary font-serif">
            {summary}
          </p>
        </div>
      )}
    </section>
  )
}