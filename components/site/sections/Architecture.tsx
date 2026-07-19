'use client'

import { motion } from 'framer-motion'
import { Reveal, SectionHeading } from '../Reveal'

const LAYERS = [
  {
    id: 'ingest',
    label: 'Ingestion',
    sub: 'TXT · MD · transcripts',
    color: 'rgba(155,123,216,0.7)',
    width: '100%',
  },
  {
    id: 'context',
    label: 'Context assembly',
    sub: 'Per-source · full-document',
    color: 'rgba(155,123,216,0.55)',
    width: '92%',
  },
  {
    id: 'extract',
    label: 'Insight extraction',
    sub: 'Streaming · evidence-bound',
    color: 'rgba(232,177,78,0.7)',
    width: '78%',
  },
  {
    id: 'cluster',
    label: 'Theme clustering',
    sub: 'Semantic · segment-aware',
    color: 'rgba(232,177,78,0.55)',
    width: '64%',
  },
  {
    id: 'prioritize',
    label: 'Prioritization',
    sub: 'Impact × urgency',
    color: 'rgba(232,177,78,0.4)',
    width: '46%',
  },
  {
    id: 'report',
    label: 'Report synthesis',
    sub: 'Boardroom-ready output',
    color: 'rgba(245,241,232,0.6)',
    width: '28%',
  },
]

export function Architecture() {
  return (
    <section id="architecture" className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '40%',
            top: '20%',
            width: '40%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.1), transparent 70%)',
          }}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="AI architecture"
            title={
              <>
                A pipeline designed to{' '}
                <span className="serif-italic text-accent">
                  refuse
                </span>{' '}
                to invent.
              </>
            }
            subtitle="Each layer is constrained by evidence. The pipeline reads every source, extracts insights, clusters them into themes, and synthesizes a report — all grounded in what your documents actually say."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-start">
          {/* Pyramid diagram */}
          <Reveal delay={0.1}>
            <div className="card p-6 lg:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-dotgrid opacity-30" />
              <div className="relative space-y-3">
                {LAYERS.map((l, i) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      delay: i * 0.12,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="relative"
                  >
                    <div
                      className="relative h-16 rounded-lg flex items-center justify-between px-5 border border-border bg-surface-raised overflow-hidden"
                      style={{ width: l.width, marginLeft: 'auto', marginRight: 'auto' }}
                    >
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${l.color})`,
                        }}
                      />
                      <div className="relative">
                        <p className="text-sm font-medium text-text-primary">
                          {l.label}
                        </p>
                        <p className="text-[11px] font-mono text-text-muted mt-0.5">
                          {l.sub}
                        </p>
                      </div>
                      <span className="relative text-[10px] font-mono text-text-muted">
                        L{String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>sources → lens → report</span>
                <span>evidence-bound · refuse-by-design</span>
              </div>
            </div>
          </Reveal>

          {/* Right — principles */}
          <Reveal delay={0.2}>
            <div className="space-y-6">
              <Principle
                index="I."
                title="Read everything, sample nothing."
                body="Telescope reads each source end-to-end. Large corpora are capped at ~800K characters to stay within model context windows, but within that limit, nothing is sampled or summarized before analysis."
              />
              <Principle
                index="II."
                title="Every insight is traceable."
                body="Each extracted insight is tied to a specific source document. The report is built from these insights, and you can click any quote to see it in its original context."
              />
              <Principle
                index="III."
                title="Segment-aware by default."
                body="SMB and enterprise pain don't blend. Insights are tagged by segment during extraction, and the report breaks down findings per segment."
              />
              <Principle
                index="IV."
                title="The report answers back."
                body="Ask follow-up questions about the report. The interrogation panel sends your question along with the report data to the model so answers stay grounded in the evidence."
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function Principle({
  index,
  title,
  body,
}: {
  index: string
  title: string
  body: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex gap-5"
    >
      <div className="flex-shrink-0 font-serif text-3xl text-accent leading-none mt-1">
        {index}
      </div>
      <div>
        <h3 className="text-lg text-text-primary mb-2 leading-snug">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{body}</p>
      </div>
    </motion.div>
  )
}