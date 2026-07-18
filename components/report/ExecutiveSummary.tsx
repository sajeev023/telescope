'use client'

import { Lightbulb } from 'lucide-react'
import { SectionHeading } from './SegmentBadge'

export function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <section className="mb-16">
      <SectionHeading icon={<Lightbulb className="w-4 h-4" />} label="Executive Summary" />
      <div className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/20 transition-colors border-l-4 border-l-accent">
        <p className="text-lg leading-relaxed text-text-primary">
          {summary}
        </p>
      </div>
    </section>
  )
}