'use client'

import { motion } from 'framer-motion'
import {
  ScanText,
  Layers,
  Quote,
  BarChart3,
  GitBranch,
  ShieldCheck,
  FileDown,
  MessagesSquare,
  Lightbulb,
} from 'lucide-react'
import { Reveal, SectionHeading } from '../Reveal'

const FEATURES = [
  {
    icon: ScanText,
    title: 'Reads every source.',
    body: 'No sample. No truncation. Telescope ingests every transcript end-to-end and keeps the context.',
  },
  {
    icon: Lightbulb,
    title: 'Extracts insights, not summaries.',
    body: 'Each insight is a discrete, evidence-backed claim — not a vague restatement of what people said.',
  },
  {
    icon: Layers,
    title: 'Clusters into themes.',
    body: 'Related insights are grouped. You see the shape of the conversation, not the noise.',
  },
  {
    icon: BarChart3,
    title: 'Prioritizes by impact & urgency.',
    body: 'A 2D priority matrix surfaces the few themes that actually deserve attention this quarter.',
  },
  {
    icon: Quote,
    title: 'Every claim is sourced.',
    body: 'Click any finding. See the exact quote, the speaker, the source document. Evidence over invention.',
  },
  {
    icon: GitBranch,
    title: 'Segments stay segments.',
    body: 'Designed for SaaS customer research. SMB, enterprise, freelancer — Telescope keeps each segment distinct so you don&apos;t blend their pain.',
  },
  {
    icon: MessagesSquare,
    title: 'Interrogate the report.',
    body: 'Ask follow-up questions in plain English. The AI answers using only the synthesized report.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust over hallucination.',
    body: 'Telescope refuses to invent. If the sources don&apos;t support a claim, the claim doesn&apos;t appear.',
  },
  {
    icon: FileDown,
    title: 'Boardroom-ready export.',
    body: 'One click. A printable PDF with cover page, sections, and sourced quotes — ready to circulate.',
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 lg:py-32 relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Features"
            title={
              <>
                Every feature is in service of one thing:{' '}
                <span className="serif-italic text-accent">
                  trust
                </span>
                .
              </>
            }
            subtitle="A research tool is only as good as the evidence behind it. Telescope is built so you can defend every word in the report."
          />
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 0.06}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group relative card p-6 h-full overflow-hidden"
              >
                {/* Hover gradient hairline */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-text-secondary group-hover:text-accent group-hover:border-accent/40 transition-colors duration-300">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-text-primary mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {f.body}
                    </p>
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}