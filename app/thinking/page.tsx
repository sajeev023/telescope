'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Loader2,
  FileText,
  Lightbulb,
  GitBranch,
  BarChart3,
  FileCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react'
import {
  REPORT_STORAGE_KEY,
  TELESCOPE_REPORT_STORAGE_KEY,
  FILES_STORAGE_KEY,
  TRANSCRIPTS_STORAGE_KEY,
} from '@/lib/data'

type StepStatus = 'pending' | 'active' | 'done'

type Step = {
  label: string
  icon: React.ReactNode
}

const STEPS: Step[] = [
  { label: 'Reading source documents...', icon: <FileText className="w-5 h-5" /> },
  { label: 'Reading source documents...', icon: <FileText className="w-5 h-5" /> },
  { label: 'Reading source documents...', icon: <FileText className="w-5 h-5" /> },
  { label: 'Reading source documents...', icon: <FileText className="w-5 h-5" /> },
  { label: 'Reading source documents...', icon: <FileText className="w-5 h-5" /> },
  { label: 'Extracting insights from all sources...', icon: <Lightbulb className="w-5 h-5" /> },
  { label: 'Clustering insights into themes...', icon: <GitBranch className="w-5 h-5" /> },
  { label: 'Prioritizing by impact and frequency...', icon: <BarChart3 className="w-5 h-5" /> },
  { label: 'Verifying insights against source data...', icon: <FileCheck className="w-5 h-5" /> },
  { label: 'Generating boardroom-ready report...', icon: <Sparkles className="w-5 h-5" /> },
]

type Insight = {
  text: string
  segment: 'smb' | 'enterprise' | 'freelancer'
}

const SEGMENT_STYLES: Record<
  Insight['segment'],
  { label: string; classes: string }
> = {
  smb: {
    label: 'SMB',
    classes: 'bg-accent/10 text-accent border-accent/20',
  },
  enterprise: {
    label: 'Enterprise',
    classes: 'bg-success/10 text-success border-success/20',
  },
  freelancer: {
    label: 'Freelancer',
    classes: 'bg-warning/10 text-warning border-warning/20',
  },
}

export default function ThinkingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [visibleInsights, setVisibleInsights] = useState(0)
  const [liveInsights, setLiveInsights] = useState<Insight[]>([])
  const [customProgress, setCustomProgress] = useState<number | null>(null)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasSavedReportRef = useRef(false)
  const errorRef = useRef<string | null>(null)

  const saveFinalReport = (reportData?: unknown) => {
    if (hasSavedReportRef.current) return
    if (typeof window === 'undefined') return
    if (!reportData) return

    hasSavedReportRef.current = true
    const json = JSON.stringify(reportData)
    sessionStorage.setItem(REPORT_STORAGE_KEY, json)
    sessionStorage.setItem(TELESCOPE_REPORT_STORAGE_KEY, json)
  }

  // Connect to /api/analyze via SSE
  useEffect(() => {
    const controller = new AbortController()
    errorRef.current = null

    const runAnalysis = async () => {
      let filesData: Array<{ name: string; content: string }> = []
      if (typeof window !== 'undefined') {
        const stored =
          sessionStorage.getItem(FILES_STORAGE_KEY) ||
          sessionStorage.getItem(TRANSCRIPTS_STORAGE_KEY)
        if (stored) {
          try {
            filesData = JSON.parse(stored)
          } catch {
            // ignore
          }
        }
      }

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
          throw new Error(`SSE endpoint returned status ${response.status}`)
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
                setCurrentStep(STEPS.length)
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

                if (parsed.insight) {
                  setLiveInsights((prev) => [...prev, parsed.insight])
                  setVisibleInsights((n) => n + 1)
                }

                if (parsed.report) {
                  saveFinalReport(parsed.report)
                }

                if (parsed.complete || parsed.status === 'complete') {
                  setCurrentStep(STEPS.length)
                  setComplete(true)
                  if (parsed.report) saveFinalReport(parsed.report)
                }
              } catch {
                // Ignore raw non-JSON SSE lines
              }
            }
          }
        }

        if (!controller.signal.aborted && !errorRef.current) {
          setCurrentStep(STEPS.length)
          setComplete(true)
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return
        }
        console.warn(
          'Connecting to /api/analyze failed or endpoint unavailable. Running fallback timer.',
          err
        )
        // Smooth fallback progression if SSE endpoint unavailable
        let step = 0
        const interval = setInterval(() => {
          if (controller.signal.aborted) {
            clearInterval(interval)
            return
          }
          step += 1
          setCurrentStep(step)

          if (step >= STEPS.length) {
            clearInterval(interval)
            setError('Could not connect to the analysis engine. Please check your API configuration and try again.')
          }
        }, 1200)
      }
    }

    runAnalysis()

    return () => {
      controller.abort()
    }
  }, [])

  // Insight feed gradual reveal
  useEffect(() => {
    if (visibleInsights >= liveInsights.length) return
    const t = setTimeout(() => {
      setVisibleInsights((n) => n + 1)
    }, 500)
    return () => clearTimeout(t)
  }, [visibleInsights, liveInsights.length])

  // Redirect after completion
  useEffect(() => {
    if (!complete) return
    const t = setTimeout(() => {
      router.push('/report')
    }, 1500)
    return () => clearTimeout(t)
  }, [complete, router])

  const progress =
    customProgress !== null
      ? customProgress
      : Math.min((currentStep / STEPS.length) * 100, 100)

  const statusOf = (i: number): StepStatus => {
    if (i < currentStep) return 'done'
    if (i === currentStep && !complete) return 'active'
    return 'pending'
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesizing</span>
          </div>
          <h1 className="text-3xl font-bold text-text-primary">
            Telescope is thinking
          </h1>
          <p className="text-text-secondary mt-1">
            Reading your sources and clustering insights in real time.
          </p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <ul className="space-y-2">
                {STEPS.map((step, i) => {
                  const status = statusOf(i)
                  return (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0.4 }}
                      animate={{
                        opacity: status === 'pending' ? 0.4 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                        status === 'active'
                          ? 'bg-accent/10 border border-accent/30'
                          : 'border border-transparent'
                      }`}
                    >
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center">
                        {status === 'done' ? (
                          <CheckCircle2 className="w-6 h-6 text-success" />
                        ) : status === 'active' ? (
                          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-surface-raised flex items-center justify-center text-text-muted">
                            {step.icon}
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-sm flex-1 ${
                          status === 'done'
                            ? 'text-text-secondary line-through'
                            : status === 'active'
                              ? 'text-text-primary font-medium'
                              : 'text-text-muted'
                        }`}
                      >
                        {step.label}
                      </span>
                    </motion.li>
                  )
                })}
              </ul>
            </div>

            {/* Progress bar */}
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between mb-2 text-xs text-text-secondary">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-raised overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Live insight feed */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-border bg-surface p-5 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-semibold text-text-primary">
                    Live insight feed
                  </h2>
                </div>
                <span className="text-xs text-text-muted">
                  {liveInsights.length > 0
                    ? `${visibleInsights}/${liveInsights.length}`
                    : '--'}
                </span>
              </div>
              <ul className="space-y-2">
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
                        transition={{ duration: 0.3 }}
                        className="rounded-lg border border-border bg-surface-raised px-3 py-2.5"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border font-medium flex-shrink-0 ${style.classes}`}
                          >
                            {style.label}
                          </span>
                          <p className="text-xs text-text-primary leading-relaxed">
                            {insight.text}
                          </p>
                        </div>
                      </motion.li>
                    )
                  })}
                </AnimatePresence>
              </ul>

              {liveInsights.length === 0 && !complete && !error && (
                <p className="text-xs text-text-muted text-center py-8">
                  Waiting for insights...
                </p>
              )}

              <AnimatePresence>
                {complete && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent border border-accent/20">
                        {liveInsights.length} insights
                      </span>
                      <span className="px-2 py-1 rounded-md bg-success/10 text-success border border-success/20">
                        Report ready
                      </span>
                    </div>
                    <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Redirecting to report...
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
