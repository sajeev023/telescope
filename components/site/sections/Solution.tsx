'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Quote } from 'lucide-react'
import { Reveal, SectionHeading } from '../Reveal'

export function Solution() {
  return (
    <section id="solution" className="py-24 lg:py-32 relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="The solution"
            title={
              <>
                From messy transcripts to{' '}
                <span className="serif-italic text-accent">
                  structured intelligence
                </span>
                .
              </>
            }
            subtitle="Telescope doesn't summarize. It synthesizes. It reads every source, extracts evidence-backed insights, clusters them into themes, and grades each one by impact and urgency."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-8 items-stretch">
            {/* Before */}
            <div className="card p-7">
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow text-text-muted">Before</span>
                <span className="text-[11px] font-mono text-text-muted">manual</span>
              </div>
              <div className="space-y-3">
                {[
                  'interview_032_transcript.txt',
                  'support-call-q3-notes.md',
                  'sales-discovery-enterprise.txt',
                  'ux-research-smb-session-04.txt',
                  '...29 more files',
                ].map((f, i) => (
                  <motion.div
                    key={f}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-surface-raised border border-border"
                  >
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    <span className="text-xs font-mono text-text-secondary truncate">
                      {f}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-text-muted italic">
                  "We ran the calls. Nobody read them."
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <motion.div
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-accent"
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </div>

            {/* After */}
            <div className="card-raised p-7 gradient-border">
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow text-accent">After</span>
                <span className="text-[11px] font-mono text-accent">telescope</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Executive Summary', count: 'Synthesized' },
                  { name: 'Key Findings', count: 'Ranked by evidence' },
                  { name: 'Themes', count: 'Auto-clustered' },
                  { name: 'Priority Matrix', count: 'Impact × urgency' },
                  { name: 'Recommendations', count: 'Evidence-backed' },
                  { name: 'Notable Quotes', count: 'Verbatim from sources' },
                ].map((f, i) => (
                  <motion.div
                    key={f.name}
                    initial={{ opacity: 0, x: 8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.07, duration: 0.5 }}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-surface-raised border border-border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <span className="text-sm text-text-primary">{f.name}</span>
                    </div>
                    <span className="text-xs font-mono text-text-secondary">
                      {f.count}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex gap-2 items-start">
                  <Quote className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-text-primary italic leading-relaxed">
                    "Telescope automatically categorizes insights by severity, mapping critical concerns
                    against target segments to identify priority decisions instantly."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}