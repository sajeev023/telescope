'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Loader2,
  FileText,
  Lightbulb,
  GitBranch,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import { getStoredFiles, saveReportFromStream } from '@/lib/storage'
import { TelescopeMark } from '@/components/site/Logo'

type StepStatus = 'pending' | 'active' | 'done'

type Phase = 'reading' | 'extracting' | 'clustering' | 'generating'

type ReadingEvent = { file: string; chars: number; words: number; empty: boolean }

type Step = {
  label: string
  icon: React.ReactNode
  phase: Phase | 'reading'
}

function buildSteps(fileNames: string[]): Step[] {
  const readingSteps: Step[] = fileNames.map((name) => ({
    label: `Reading ${name}`,
    icon: <FileText className="w-4 h-4" />,
    phase: 'reading',
  }))

  return [
    ...(readingSteps.length > 0
      ? readingSteps
      : [
          {
            label: 'Reading source documents',
            icon: <FileText className="w-4 h-4" />,
            phase: 'reading' as const,
          },
        ]),
    {
      label: 'Extracting insights from every source',
      icon: <Lightbulb className="w-4 h-4" />,
      phase: 'extracting',
    },
    {
      label: 'Clustering insights into themes',
      icon: <GitBranch className="w-4 h-4" />,
      phase: 'clustering',
    },
    {
      label: 'Generating boardroom-ready report',
      icon: <Sparkles className="w-4 h-4" />,
      phase: 'generating',
    },
  ]
}

type Insight = {
  text: string
  segment: 'smb' | 'enterprise' | 'freelancer' | 'general'
  source?: string
  confidence?: number
}

const SEGMENT_STYLES: Record<Insight['segment'], { label: string; classes: string }> = {
  smb: { label: 'SMB', classes: 'bg-accent/10 text-accent border-accent/20' },
  enterprise: { label: 'Enterprise', classes: 'bg-success/10 text-success border-success/20' },
  freelancer: { label: 'Freelancer', classes: 'bg-warning/10 text-warning border-warning/20' },
  general: { label: 'General', classes: 'bg-info/10 text-info border-info/20' },
}

export default function ThinkingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [visibleInsights, setVisibleInsights] = useState(0)
  const [liveInsights, setLiveInsights] = useState<Insight[]>([])
  const [customProgress, setCustomProgress] = useState<number | null>(null)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [readingInfo, setReadingInfo] = useState<ReadingEvent | null>(null)
  const [savedReportId, setSavedReportId] = useState<string | null>(null)
  const hasSavedReportRef = useRef(false)
  const errorRef = useRef<string | null>(null)

  const [steps] = useState<Step[]>(() => {
    if (typeof window === 'undefined') return buildSteps([])
    const stored = getStoredFiles()
    if (stored.length > 0) {
      return buildSteps(stored.map((f) => f.name || 'Untitled'))
    }
    return buildSteps([])
  })

  useEffect(() => {
    const controller = new AbortController()
    errorRef.current = null

    const runAnalysis = async () => {
      const filesData = getStoredFiles().map((f) => ({
        name: f.name,
        content: f.content || '',
      }))

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ files: filesData }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          // Surface the actual error from the JSON body if we can.
          let message = `Analysis endpoint returned status ${response.status}`
          try {
            const errBody = await response.json()
            if (errBody?.error) message = errBody.error
          } catch { /* ignore */ }
          throw new Error(message)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (!controller.signal.aborted) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith(':')) continue

            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.slice(5).trim()

              if (dataStr === '[DONE]') {
                setCurrentStep(steps.length)
                setComplete(true)
                break
              }

              try {
                const parsed = JSON.parse(dataStr)

                if (parsed.error) {
                  errorRef.current = parsed.error
                  setError(parsed.error)
                  break
                }

                if (parsed.progress !== undefined) {
                  setCustomProgress(parsed.progress)
                }

                if (parsed.step !== undefined) {
                  setCurrentStep(parsed.step)
                }

                if (parsed.reading) {
                  setReadingInfo(parsed.reading as ReadingEvent)
                }

                if (parsed.insight) {
                  setLiveInsights((prev) => [...prev, parsed.insight as Insight])
                }

                if (parsed.complete || parsed.status === 'complete') {
                  if (parsed.report) {
                    hasSavedReportRef.current = true
                    const id = saveReportFromStream(parsed.report)
                    if (id) setSavedReportId(id)
                  }
                  setCurrentStep(steps.length)
                  setComplete(true)
                }
              } catch {
                // Ignore raw non-JSON SSE lines
              }
            }
          }
        }

        if (!controller.signal.aborted && !errorRef.current && !hasSavedReportRef.current) {
          // Stream ended without a complete event but also without an
          // error — surface this honestly rather than silently redirecting.
          setError('The analysis stream ended unexpectedly. Please try again.')
        }
      } catch (err) {
        if (controller.signal.aborted) return
        const message = err instanceof Error ? err.message : 'Could not connect to the analysis engine.'
        console.warn('Analysis failed:', err)
        setError(message)
      }
    }

    runAnalysis()

    return () => {
      controller.abort()
    }
  }, [steps.length])

  // Drip-roll the insight feed so newly-arrived insights animate in
  // one at a time instead of appearing in a burst.
  useEffect(() => {
    if (visibleInsights >= liveInsights.length) return
    const t = setTimeout(() => {
      setVisibleInsights((n) => n + 1)
    }, 120)
    return () => clearTimeout(t)
  }, [visibleInsights, liveInsights.length])

  useEffect(() => {
    if (!complete) return
    router.push(savedReportId ? `/report?id=${savedReportId}` : '/report')
  }, [complete, router, savedReportId])

  const progress =
    customProgress !== null
      ? customProgress
      : Math.min((currentStep / steps.length) * 100, 100)

  const statusOf = (i: number): StepStatus => {
    if (complete) return 'done'
    if (i < currentStep) return 'done'
    if (i === currentStep) return 'active'
    return 'pending'
  }

  const phaseLabel = (() => {
    if (complete) return 'complete'
    if (error) return 'error'
    if (currentStep < steps.length && steps[currentStep]) {
      return steps[currentStep].phase
    }
    return 'idle'
  })()

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora"
          style={{
            left: '20%',
            top: '10%',
            width: '50%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.14), transparent 70%)',
          }}
        />
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            right: '15%',
            top: '40%',
            width: '45%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(155,123,216,0.08), transparent 70%)',
          }}
        />
        <div className="absolute inset-0 bg-dotgrid opacity-25" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-12 lg:py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur-sm text-xs uppercase tracking-editorial-wide text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Step 02 · Synthesize
          </div>
          <h1 className="editorial-display text-display-lg mt-6 text-text-primary">
            Telescope is{' '}
            <span className="serif-italic text-accent">
              {complete ? 'done' : 'thinking'}
            </span>
            .
          </h1>
          <p className="text-text-secondary mt-4 max-w-xl">
            Reading every source end-to-end, extracting evidence-backed
            insights, clustering them into themes, and writing the final
            report. Insights stream in live as the model works.
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-raised border border-border">
            <span className="text-xs font-mono uppercase tracking-editorial-wide text-text-muted">
              phase
            </span>
            <span className="text-xs font-mono text-accent">{phaseLabel}</span>
            <span className="text-border">·</span>
            <span className="text-xs font-mono text-text-secondary tabular-nums">
              {Math.round(progress)}%
            </span>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Analysis failed</p>
              <p className="text-text-secondary">{error}</p>
              <button
                type="button"
                onClick={() => router.push('/upload')}
                className="mt-2 text-accent hover:underline text-xs"
              >
                Back to upload
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="space-y-5">
            <div className="card p-6 lg:p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="eyebrow">
                  <span className="text-accent">
                    <TelescopeMark className="w-4 h-4" />
                  </span>
                  Pipeline
                </span>
                <span className="text-xs font-mono text-text-muted tabular-nums">
                  {Math.min(currentStep + (complete ? 0 : 1), steps.length)} /{' '}
                  {steps.length}
                </span>
              </div>
              <ul className="space-y-1.5">
                {steps.map((step, i) => {
                  const status = statusOf(i)
                  const isReading = step.phase === 'reading' && status === 'active' && readingInfo?.file === step.label.replace('Reading ', '')
                  return (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0.5 }}
                      animate={{
                        opacity: status === 'pending' ? 0.45 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                        status === 'active'
                          ? 'bg-accent/10 border border-accent/30 shadow-glow-accent'
                          : 'border border-transparent'
                      }`}
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center">
                        {status === 'done' ? (
                          <CheckCircle2 className="w-5 h-5 text-success" />
                        ) : status === 'active' ? (
                          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center text-background">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-text-muted">
                            {step.icon}
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-sm flex-1 ${
                          status === 'done'
                            ? 'text-text-secondary line-through decoration-text-muted/40'
                            : status === 'active'
                              ? 'text-text-primary font-medium'
                              : 'text-text-muted'
                        }`}
                      >
                        {step.label}
                        {isReading && readingInfo && (
                          <span className="ml-2 text-xs font-mono text-text-muted">
                            · {readingInfo.words.toLocaleString()} words · {readingInfo.chars.toLocaleString()} chars
                          </span>
                        )}
                      </span>
                      {status === 'done' && (
                        <span className="text-xs font-mono text-success">OK</span>
                      )}
                      {status === 'active' && (
                        <span className="text-xs font-mono text-accent animate-pulse">LIVE</span>
                      )}
                    </motion.li>
                  )
                })}
              </ul>
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-text-secondary uppercase tracking-editorial-wide">
                  Synthesis progress
                </span>
                <span className="font-mono text-text-primary tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-raised overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent via-accent to-accent/60 relative"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-r from-transparent to-background/40" />
                </motion.div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs font-mono text-text-muted">
                <span>read → extract → cluster → generate</span>
                <span>{complete ? 'complete' : 'streaming'}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 lg:p-6 lg:sticky lg:top-24 lg:self-start">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-accent" />
                </span>
                <div>
                  <h2 className="text-sm font-medium text-text-primary">
                    Live insight feed
                  </h2>
                  <p className="text-xs font-mono text-text-muted mt-0.5">
                    streaming · {complete ? 'closed' : 'open'}
                  </p>
                </div>
              </div>
              <span className="text-xs text-text-muted font-mono tabular-nums">
                {liveInsights.length > 0
                  ? `${visibleInsights}/${liveInsights.length}`
                  : '--'}
              </span>
            </div>

            <ul className="space-y-2.5 max-h-[480px] overflow-y-auto no-scrollbar">
              <AnimatePresence initial={false}>
                {liveInsights.slice(0, visibleInsights).map((insight, i) => {
                  const style = SEGMENT_STYLES[insight.segment] || {
                    label: 'General',
                    classes: 'bg-accent/10 text-accent border-accent/20',
                  }
                  return (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-xl border border-border bg-surface-raised px-3.5 py-3"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${style.classes}`}
                        >
                          {style.label}
                        </span>
                        <p className="text-sm text-text-primary leading-relaxed">
                          {insight.text}
                        </p>
                      </div>
                      {insight.source && (
                        <p className="text-xs text-text-muted mt-2 font-mono pl-2">
                          — {insight.source}
                          {typeof insight.confidence === 'number' && (
                            <span className="ml-2 text-text-muted">
                              · conf {insight.confidence.toFixed(2)}
                            </span>
                          )}
                        </p>
                      )}
                    </motion.li>
                  )
                })}
              </AnimatePresence>
            </ul>

            {liveInsights.length === 0 && !complete && !error && (
              <div className="py-12 text-center">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="inline-flex items-center gap-2 text-sm text-text-muted"
                >
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Waiting for the first insight…
                </motion.div>
              </div>
            )}

            <AnimatePresence>
              {complete && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-5 pt-5 border-t border-border"
                >
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 rounded-md bg-accent/10 text-accent border border-accent/20 font-mono">
                      {liveInsights.length} insights
                    </span>
                    <span className="px-2 py-1 rounded-md bg-success/10 text-success border border-success/20 font-mono">
                      Report ready
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Redirecting to report…
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}