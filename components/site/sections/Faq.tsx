'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Reveal, SectionHeading } from '../Reveal'

const FAQS = [
  {
    q: 'How do you prevent hallucinations?',
    a: 'The model is instructed with strict rules against fabrication. Every insight is tied to a specific source document, and you can click through to verify claims in their original context. The system prompt enforces evidence-only output — if the documents don\'t support a claim, the model is told to say so rather than invent.',
  },
  {
    q: 'What file formats do you support?',
    a: 'Plain text today: .txt, .md, .csv, and .json. We focus on transcripts because that is the highest-signal qualitative data most teams have. Support for audio, PDF, and video is on the roadmap.',
  },
  {
    q: 'How long does an analysis take?',
    a: 'A 5-source report typically completes in 30–90 seconds. Larger corpora scale roughly linearly. You see insights stream in live while the pipeline runs — no waiting on a spinner.',
  },
  {
    q: 'Can I ask follow-up questions of the report?',
    a: 'Yes. Every report has an interrogation panel where you can ask questions in plain English. Your question and the report data are sent to the model together, so answers stay grounded in the evidence rather than the model\'s general knowledge.',
  },
  {
    q: 'Where does my data live?',
    a: 'In your browser session by default — nothing is persisted on our servers. Uploaded sources are sent to the model provider only for the duration of the analysis.',
  },
  {
    q: 'Can I export to PDF?',
    a: 'Yes — one click. The PDF is a print-optimized version of the live report: executive summary, key findings, themes, recommendations, notable quotes, and a sources-analyzed index.',
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="py-24 lg:py-32">
      <div className="max-w-[1100px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="FAQ"
            align="center"
            title={
              <>
                Questions you&apos;re probably{' '}
                <span className="serif-italic text-accent">
                  already
                </span>{' '}
                asking.
              </>
            }
          />
        </Reveal>

        <div className="mt-14 space-y-2">
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <Reveal key={f.q} delay={i * 0.04}>
                <div
                  className={`card overflow-hidden transition-colors ${
                    isOpen ? 'bg-surface-raised' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base text-text-primary font-medium">
                      {f.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-shrink-0 w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center text-text-secondary"
                    >
                      <Plus className="w-4 h-4" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 text-sm text-text-secondary leading-relaxed">
                          {f.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}