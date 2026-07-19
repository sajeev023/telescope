'use client'

import { motion } from 'framer-motion'
import { Quote, ShieldCheck, Eye, Cpu } from 'lucide-react'
import { Reveal, SectionHeading } from '../Reveal'

// This section deliberately uses honest social proof — design principles and
// open methodology — instead of fabricated customer testimonials with fake
// names and titles. Telescope is a hackathon project; we don't have paying
// customers yet, and inventing them would be the kind of trust violation
// this product was built to expose.

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    quote:
      'The system prompt instructs the model to use only verbatim quotes from source documents. We never ask the model to invent, paraphrase, or improve quotes. Every quote is traceable to its source.',
    label: 'Anti-hallucination contract',
    detail: 'Quotes are tied to source documents. Click any quote to see it in its original context.',
  },
  {
    icon: Eye,
    quote:
      'Click any quote, any finding, any theme — you land in the source document at the exact passage. Research that can\'t be traced is just opinion.',
    label: 'Source traceability',
    detail: 'The source viewer shows the original passage with the quote highlighted. No black boxes.',
  },
  {
    icon: Cpu,
    quote:
      'The pipeline runs three real LLM calls — extraction, clustering, synthesis — and shows you what each phase is doing. No fake "reading 47 sources in 3 seconds" theatrics.',
    label: 'An honest pipeline',
    detail: 'Streaming, observable, and accountable. You see insights arrive in real time as each phase completes.',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 lg:py-32 relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Principles"
            align="center"
            title={
              <>
                What Telescope{' '}
                <span className="serif-italic text-accent">
                  refuses
                </span>{' '}
                to do.
              </>
            }
            subtitle="We don't have customer logos yet. We have rules. Here are the three we won't break."
          />
        </Reveal>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRINCIPLES.map((t, i) => {
            const Icon = t.icon
            return (
              <Reveal key={t.label} delay={i * 0.08}>
                <motion.figure
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="card p-7 h-full flex flex-col"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] uppercase tracking-editorial-wide text-text-muted mb-3">
                    {t.label}
                  </p>
                  <blockquote className="flex-1 text-base text-text-primary leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 pt-5 border-t border-border">
                    <p className="text-xs text-text-muted leading-relaxed">
                      {t.detail}
                    </p>
                  </figcaption>
                </motion.figure>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-text-muted">
            <Quote className="w-3.5 h-3.5 text-accent/60" />
            <span>
              No fake customer logos. No invented testimonials. No vaporware
              features. Built for a hackathon, judged on what it actually does.
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}