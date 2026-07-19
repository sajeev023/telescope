'use client'

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Reveal, SectionHeading } from '../Reveal'

const ROWS = [
  { label: 'Time to first insight', old: '2–6 weeks', neo: 'Under a minute' },
  { label: 'Coverage', old: 'Sampled · ~20%', neo: 'Every source · 100%' },
  { label: 'Source traceability', old: 'Manual · unreliable', neo: 'Per-claim citation' },
  { label: 'Segment separation', old: 'Blended together', neo: 'Distinct profiles' },
  { label: 'Hallucinations', old: 'Common · unchecked', neo: 'Refused by design' },
  { label: 'Priority matrix', old: 'Ad hoc · opinion-based', neo: 'Impact × urgency' },
  { label: 'Format', old: 'Slides + spreadsheets', neo: 'Live report + PDF' },
  { label: 'Follow-up questions', old: 'Re-run the analysis', neo: 'Ask the report' },
]

export function WhyTelescope() {
  return (
    <section id="why" className="py-24 lg:py-32 bg-surface/20 border-y border-border/60">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Why Telescope"
            title={
              <>
                Traditional analysis is a{' '}
                <span className="serif-italic text-text-secondary">
                  tax
                </span>
                . Telescope is a{' '}
                <span className="serif-italic text-accent">
                  telescope
                </span>
                .
              </>
            }
            subtitle="The point isn't faster research. It's research you can defend. The point is trust."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 card overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-border">
              <div className="px-6 py-5 text-[11px] uppercase tracking-editorial-wide text-text-muted">
                What you get
              </div>
              <div className="px-6 py-5 border-l border-border bg-surface/40">
                <p className="text-sm text-text-secondary">Traditional analysis</p>
                <p className="text-[11px] text-text-muted font-mono mt-0.5">
                  manual · spreadsheets
                </p>
              </div>
              <div className="px-6 py-5 border-l border-border bg-accent/5">
                <p className="text-sm text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Telescope
                </p>
                <p className="text-[11px] text-accent font-mono mt-0.5">
                  Telescope · v0.1
                </p>
              </div>
            </div>

            {/* Rows */}
            {ROWS.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
                className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-border last:border-b-0 group"
              >
                <div className="px-6 py-4 text-sm text-text-primary font-medium">
                  {row.label}
                </div>
                <div className="px-6 py-4 border-l border-border bg-surface/40 flex items-start gap-2">
                  <X className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-secondary">{row.old}</span>
                </div>
                <div className="px-6 py-4 border-l border-border bg-accent/5 flex items-start gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-text-primary">{row.neo}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}