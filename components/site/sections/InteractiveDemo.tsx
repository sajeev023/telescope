'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Loader2,
  Sparkles,
  BarChart3,
  FileCheck,
  Lightbulb,
} from 'lucide-react'
import { Reveal, SectionHeading } from '../Reveal'

const STEPS = [
  {
    id: 'upload',
    label: 'Upload',
    icon: Upload,
    sublabel: 'Drop your transcripts.',
    detail: '5 sources · TXT / MD',
  },
  {
    id: 'think',
    label: 'Think',
    icon: Loader2,
    sublabel: 'Telescope reads every source.',
    detail: 'Streaming · reading 5 of 5',
  },
  {
    id: 'extract',
    label: 'Extract',
    icon: Lightbulb,
    sublabel: 'Insights surface in real time.',
    detail: '14 insights extracted',
  },
  {
    id: 'report',
    label: 'Report',
    icon: BarChart3,
    sublabel: 'Boardroom-ready output.',
    detail: '5 themes · 3 findings · 5 quotes',
  },
]

export function InteractiveDemo() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setActive((a) => (a + 1) % STEPS.length)
    }, 2400)
    return () => clearTimeout(t)
  }, [active])

  const ActiveIcon = STEPS[active].icon

  return (
    <section
      id="demo"
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '30%',
            top: '20%',
            width: '40%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.12), transparent 70%)',
          }}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <SectionHeading
            eyebrow="Interactive demo"
            align="center"
            title={
              <>
                Watch it{' '}
                <span className="serif-italic text-accent">think</span>.
              </>
            }
            subtitle="The pipeline runs in 30–90 seconds. Here's the shape of it."
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Step rail */}
          <div className="card p-4 lg:p-5">
            <ul className="space-y-1">
              {STEPS.map((s, i) => {
                const isActive = i === active
                const isDone = i < active
                const Icon = s.icon
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActive(i)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-accent/10 border border-accent/30'
                          : 'border border-transparent hover:bg-surface-raised'
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-accent text-background'
                            : isDone
                              ? 'bg-success/10 text-success'
                              : 'bg-surface-raised text-text-muted'
                        }`}
                      >
                        {isDone ? (
                          <FileCheck className="w-4 h-4" />
                        ) : isActive ? (
                          <Icon
                            className={`w-4 h-4 ${
                              s.id === 'think' ? 'animate-spin' : ''
                            }`}
                          />
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            isActive
                              ? 'text-text-primary'
                              : 'text-text-secondary'
                          }`}
                        >
                          {s.label}
                        </p>
                        <p className="text-[11px] text-text-muted truncate">
                          {s.sublabel}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-mono ${
                          isActive ? 'text-accent' : 'text-text-muted'
                        }`}
                      >
                        0{i + 1}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[10px] uppercase tracking-editorial-wide text-text-muted mb-2">
                Pipeline
              </p>
              <p className="text-xs text-text-secondary font-mono leading-relaxed">
                sources → lens → themes → report
              </p>
            </div>
          </div>

          {/* Stage viewport */}
          <div className="card-raised p-6 lg:p-8 min-h-[420px] relative overflow-hidden">
            <div className="absolute inset-0 bg-dotgrid opacity-30" />
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      active === 1
                        ? 'bg-accent animate-pulse'
                        : 'bg-text-muted'
                    }`}
                  />
                  <span className="text-[11px] uppercase tracking-editorial-wide text-text-secondary">
                    {STEPS[active].label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-text-muted">
                  step {active + 1} / {STEPS.length}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div>
                    <h3 className="editorial-display text-3xl text-text-primary mb-3">
                      {STEPS[active].sublabel}
                    </h3>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {STEP_DESCRIPTIONS[active]}
                    </p>
                    <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-raised border border-border">
                      <ActiveIcon
                        className={`w-3 h-3 text-accent ${
                          active === 1 ? 'animate-spin' : ''
                        }`}
                      />
                      <span className="text-[11px] font-mono text-text-secondary">
                        {STEPS[active].detail}
                      </span>
                    </div>
                  </div>

                  <DemoVisual step={active} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const STEP_DESCRIPTIONS = [
  'Drag in transcripts, support calls, meeting notes. Plain text. No formatting required. Telescope starts reading the moment the first file lands.',
  'Telescope reads every source end-to-end, builds context, and starts emitting insights as it goes — you can watch them arrive in real time.',
  'Insights are clustered into themes, graded by severity, and tied back to the exact quotes that surfaced them. Nothing is invented.',
  'Themes become a priority matrix. Findings become ranked recommendations. The whole thing is exportable as a boardroom-ready PDF.',
]

function DemoVisual({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="rounded-xl bg-surface border border-border p-4 space-y-2">
        {[
          'interview-smb-1.txt',
          'interview-smb-2.txt',
          'interview-enterprise-1.txt',
          'interview-enterprise-2.txt',
          'interview-freelancer.txt',
        ].map((f, i) => (
          <motion.div
            key={f}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-surface-raised border border-border"
          >
            <Upload className="w-3 h-3 text-accent" />
            <span className="text-[11px] font-mono text-text-secondary flex-1 truncate">
              {f}
            </span>
            <span className="text-[10px] text-success font-mono">ready</span>
          </motion.div>
        ))}
      </div>
    )
  }
  if (step === 1) {
    return (
      <div className="rounded-xl bg-surface border border-border p-4">
        <p className="text-[10px] uppercase tracking-editorial-wide text-text-muted mb-3">
          Live insight feed
        </p>
        <div className="space-y-2">
          {[
            'SMBs find onboarding confusing in week one',
            'Enterprise needs SSO before they will trial',
            'Freelancers churn at the renewal paywall',
          ].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.3, duration: 0.4 }}
              className="px-2.5 py-2 rounded-md bg-surface-raised border border-border text-[11px] text-text-primary"
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mr-2" />
              {t}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }
  if (step === 2) {
    return (
      <div className="rounded-xl bg-surface border border-border p-4 space-y-2">
        {[
          { theme: 'Onboarding friction', count: 5, sev: 'critical' },
          { theme: 'Pricing gaps', count: 4, sev: 'high' },
          { theme: 'API stability', count: 3, sev: 'medium' },
        ].map((t, i) => (
          <motion.div
            key={t.theme}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center justify-between px-3 py-2.5 rounded-md bg-surface-raised border border-border"
          >
            <span className="text-xs text-text-primary">{t.theme}</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-text-muted">
                {t.count} insights
              </span>
              <span
                className={`text-[9px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded ${
                  t.sev === 'critical'
                    ? 'bg-error/10 text-error'
                    : t.sev === 'high'
                      ? 'bg-warning/10 text-warning'
                      : 'bg-info/10 text-info'
                }`}
              >
                {t.sev}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }
  return (
    <div className="rounded-xl bg-surface border border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-accent" />
        <span className="text-xs font-medium text-text-primary">
          Executive Summary
        </span>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        Three of the four segments share a single root cause: the activation
        flow assumes product knowledge users don&apos;t have yet. Fixing
        onboarding is the highest-leverage move this quarter.
      </p>
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] font-mono text-text-muted">
        <span>3 findings · 5 themes</span>
        <span>1 page · export-ready</span>
      </div>
    </div>
  )
}