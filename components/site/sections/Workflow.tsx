'use client'

import { motion } from 'framer-motion'
import { Reveal, SectionHeading } from '../Reveal'

const STEPS = [
  { id: '01', label: 'Upload', body: 'Drop transcripts. Any text. No formatting required.' },
  { id: '02', label: 'Analyze', body: 'Telescope ingests each source end-to-end.' },
  { id: '03', label: 'Think', body: 'Insights stream in as the model reads.' },
  { id: '04', label: 'Extract', body: 'Insights cluster into themes by segment.' },
  { id: '05', label: 'Report', body: 'Findings, quotes, priorities, recommendations.' },
  { id: '06', label: 'Share', body: 'Export a printable PDF or send the link.' },
]

export function Workflow() {
  return (
    <section id="workflow" className="py-24 lg:py-32 relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Research workflow"
            title={
              <>
                Six steps.{' '}
                <span className="serif-italic text-accent">Seconds</span>,
                not weeks.
              </>
            }
            subtitle="The whole pipeline runs in the time it takes to refill your coffee."
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-16 relative">
            {/* Timeline rail */}
            <div className="hidden lg:block absolute top-[58px] left-0 right-0 h-px bg-border" />
            <div className="hidden lg:block absolute top-[58px] left-0 h-px bg-gradient-to-r from-accent to-accent/0">
              <motion.div
                initial={{ width: '0%' }}
                whileInView={{ width: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
                className="h-px bg-gradient-to-r from-accent via-accent to-accent/20"
                style={{ width: '100%' }}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {STEPS.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{
                    delay: i * 0.12,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative"
                >
                  {/* Node */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="relative w-[58px] h-[58px] rounded-2xl bg-surface border border-border flex items-center justify-center group">
                      <div className="absolute inset-0 rounded-2xl bg-accent/0 group-hover:bg-accent/10 transition-colors duration-500" />
                      <span className="font-mono text-xs text-text-secondary group-hover:text-accent transition-colors">
                        {s.id}
                      </span>
                    </div>
                  </div>
                  <h3 className="editorial-display text-2xl text-text-primary mb-1.5">
                    {s.label}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed pr-2">
                    {s.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}