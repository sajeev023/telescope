'use client'

import { motion } from 'framer-motion'
import { Cpu, LayoutTemplate, ShieldCheck } from 'lucide-react'
import { Reveal, SectionHeading } from '../Reveal'

const STACK = [
  {
    category: 'Frontend & UI',
    icon: LayoutTemplate,
    tech: 'Next.js 14 (App Router) & React',
    tagline: 'High-fidelity, responsive client-side experience.',
    details: [
      'Next.js 14 App Router for modern file-based routing and API endpoints.',
      'TypeScript for strict compiler type safety and contract verification.',
      'Tailwind CSS & Vanilla CSS custom keyframes for premium aura gradients and animations.',
      'Framer Motion for seamless layout transitions and micro-interactions.',
      'sessionStorage for temporary in-flight transcript context and uploads.',
      'localStorage for persistent client-side reports index, capped at 50 to avoid quota overrun.'
    ],
    accent: false,
  },
  {
    category: 'AI Pipeline',
    icon: Cpu,
    tech: 'Multi-Phase Streaming Router',
    tagline: 'Constrained evidence extraction & synthesis.',
    details: [
      'Flexible provider router supporting Google Gemini, Groq, OpenAI, and local Ollama.',
      'Multi-phase streaming execution: Segment Ingestion → Insight Extraction → Theme Clustering → Report Synthesis.',
      'Strict evidence-constraint: System prompt enforces verbatim-only quotes and evidence-backed claims.',
      'Dynamic token footprint optimization: Conditional document stripping on low-TPM tiers (e.g. Groq free tier).',
      'Incremental SSE streaming parser yielding live insights directly to UI as they formulate.'
    ],
    accent: true,
  },
  {
    category: 'Infrastructure & Safety',
    icon: ShieldCheck,
    tech: 'Resilient Serverless Core',
    tagline: 'Zero-persistence, edge-ready architecture.',
    details: [
      'Serverless execution environment with a 90-second execution maximum constraint.',
      'Adaptive API client with exponential backoff on HTTP 429 rate-limit responses.',
      'Custom rate limit parser resolving Groq-style Reset Tokens duration strings (e.g., 1m4.2s).',
      'Zero database architecture: transcripts processed in-memory and cleared when the browser tab closes.',
      'Security headers: Strict Content Security Policy (CSP) and X-Frame-Options to prevent clickjacking.'
    ],
    accent: false,
  },
]

export function TechStack() {
  return (
    <section id="techstack" className="py-24 lg:py-32 relative">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '30%',
            top: '30%',
            width: '40%',
            height: '40%',
            background: 'radial-gradient(circle, rgba(155,123,216,0.06), transparent 70%)',
          }}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Technology Stack"
            align="center"
            title={
              <>
                Engineered for{' '}
                <span className="serif-italic text-accent">
                  observability
                </span>{' '}
                and trust.
              </>
            }
            subtitle="Telescope is a client-first, edge-ready hackathon project built to prove that qualitative research AI can be fast, traceable, and honest."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
          {STACK.map((s, i) => {
            const Icon = s.icon
            return (
              <Reveal key={s.category} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className={`relative card p-7 h-full flex flex-col ${
                    s.accent ? 'gradient-border bg-surface-raised' : ''
                  }`}
                >
                  {s.accent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-background text-[10px] font-medium uppercase tracking-editorial-wide">
                      Core Pipeline
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <p className="eyebrow mb-1 text-text-muted font-mono text-[10px] uppercase tracking-wider">
                      {s.category}
                    </p>
                    <h3 className="text-lg font-medium text-text-primary">
                      {s.tech}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1">{s.tagline}</p>
                  </div>

                  <div className="editorial-rule mb-6" />

                  <ul className="space-y-3.5 flex-1">
                    {s.details.map((d, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                        <span className="text-xs text-text-secondary leading-relaxed">{d}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
