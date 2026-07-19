'use client'

import { motion } from 'framer-motion'
import {
  FileText,
  Clock,
  Brain,
  ListChecks,
  Users,
  Eye,
} from 'lucide-react'
import { Reveal, SectionHeading } from '../Reveal'

const PAINS = [
  {
    icon: FileText,
    title: 'Hundreds of transcripts.',
    body: 'You ran 30 customer calls last quarter. Nobody on the team has time to read them.',
  },
  {
    icon: Clock,
    title: 'Weeks to a single insight.',
    body: 'Manual tagging, spreadsheets, affinity mapping. Findings arrive after the decisions are made.',
  },
  {
    icon: Brain,
    title: 'Cherry-picked conclusions.',
    body: 'Without evidence, the loudest voice in the room wins. Reports drift toward confirmation bias.',
  },
  {
    icon: ListChecks,
    title: 'No source traceability.',
    body: '“Users said X.” Which users? In which call? You can never get back to the quote that mattered.',
  },
  {
    icon: Users,
    title: 'Segment blind spots.',
    body: 'SMBs, enterprise, and freelancers all get blended together. Pain points that only affect one segment get lost.',
  },
  {
    icon: Eye,
    title: 'Pretty slides, no decisions.',
    body: 'Dashboards full of word clouds. No priorities, no urgency, no next action.',
  },
]

export function Problem() {
  return (
    <section id="problem" className="py-24 lg:py-32 relative">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="The problem"
            title={
              <>
                Qualitative research is{' '}
                <span className="serif-italic text-text-secondary">
                  painful
                </span>{' '}
                — and most teams just give up on it.
              </>
            }
            subtitle="Interviews are the highest-signal data you have. They're also the most expensive to read. So nobody does. The insights die in a folder."
          />
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
          {PAINS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="card p-6 h-full group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-secondary group-hover:text-accent group-hover:border-accent/30 transition-colors">
                    <p.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-text-primary">
                      {p.title}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed mt-2">
                      {p.body}
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