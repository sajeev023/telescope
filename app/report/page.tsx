'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  FileText,
  Lightbulb,
  Layers,
  AlertCircle,
  Upload,
  FolderOpen,
  ArrowUp,
  Share2,
  Check,
} from 'lucide-react'
import {
  getReportForRender,
  saveDemoReport,
  setCurrentReportId,
  getStoredFiles,
} from '@/lib/storage'
import type { Report } from '@/types/report'
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary'
import { KeyFindings } from '@/components/report/KeyFindings'
import { SegmentBreakdown } from '@/components/report/SegmentBreakdown'
import { PriorityMatrix } from '@/components/report/PriorityMatrix'
import { ThemesList } from '@/components/report/ThemesList'
import { Recommendations } from '@/components/report/Recommendations'
import { NotableQuotes } from '@/components/report/NotableQuotes'
import { Interrogation } from '@/components/report/Interrogation'
import { ExportButton } from '@/components/report/ExportButton'
import { TableOfContents } from '@/components/report/TableOfContents'
import { TelescopeMark } from '@/components/site/Logo'
import { SourceViewer } from '@/components/report/SourceViewer'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-6 animate-pulse-subtle ${className}`}>
      <div className="h-3 w-24 bg-surface-raised rounded mb-4" />
      <div className="space-y-2.5">
        <div className="h-4 bg-surface-raised rounded w-full" />
        <div className="h-4 bg-surface-raised rounded w-5/6" />
        <div className="h-4 bg-surface-raised rounded w-4/6" />
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '20%',
            top: '0%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.08), transparent 70%)',
          }}
        />
      </div>
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="h-4 w-32 bg-surface rounded-full animate-pulse-subtle mb-4" />
          <div className="h-10 w-72 bg-surface rounded animate-pulse-subtle mb-3" />
          <div className="h-4 w-96 bg-surface rounded animate-pulse-subtle" />
        </div>
        <div className="space-y-6">
          <SkeletonBlock />
          <SkeletonBlock />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonBlock />
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
          <SkeletonBlock className="h-[400px]" />
          <SkeletonBlock />
          <SkeletonBlock />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
        </div>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  const router = useRouter()
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '30%',
            top: '20%',
            width: '50%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.08), transparent 70%)',
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-error/10 border border-error/20 mb-6 text-error">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="editorial-display text-3xl text-text-primary mb-3">
          No report found
        </h2>
        <p className="text-sm text-text-secondary mb-8 max-w-sm mx-auto">{message}</p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/upload" className="btn-primary">
            <Upload className="w-4 h-4" />
            Go to Upload
          </Link>
          <button
            type="button"
            onClick={() => {
              const id = saveDemoReport()
              setCurrentReportId(id)
              router.push(`/report?id=${id}`)
            }}
            className="btn-ghost"
          >
            <Sparkles className="w-4 h-4" />
            Load demo report
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function ShareButton({ reportId }: { reportId: string | null }) {
  const [copied, setCopied] = useState(false)
  const onClick = useCallback(async () => {
    if (!reportId) return
    const url = `${window.location.origin}/report?id=${reportId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable; fall back to prompt
      window.prompt('Copy this URL to share:', url)
    }
  }, [reportId])

  if (!reportId) return null
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-ghost !py-2.5 no-print"
      aria-label="Copy shareable URL"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-success" />
          Link copied
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  )
}

function ReportPageContent() {
  const searchParams = useSearchParams()
  const [report, setReport] = useState<Report | null>(null)
  const [reportId, setReportId] = useState<string | null>(null)
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sourceFiles, setSourceFiles] = useState<
    Array<{ name: string; size: string }>
  >([])
  const [activeQuote, setActiveQuote] = useState<{
    quote: string
    source?: string
    speaker?: string
    context?: string
  } | null>(null)

  useEffect(() => {
    let cancelled = false
    try {
      const idParam = searchParams?.get('id') ?? null
      const demoParam = searchParams?.get('demo') ?? null
      const { report: r, id, isDemo: demo } = getReportForRender(
        demoParam ? null : idParam,
      )
      if (cancelled) return
      if (!r) {
        setError('The report you\'re looking for doesn\'t exist. It may have been removed or the URL may be incorrect.')
        setLoading(false)
        return
      }
      setReport(r)
      setReportId(id)
      setIsDemo(demo)

      if (!idParam && !demoParam) {
        try {
          const files = getStoredFiles()
          if (files.length > 0) {
            setSourceFiles(
              files.map((f) => ({ name: f.name, size: f.size })),
            )
          }
        } catch {
          /* ignore */
        }
      }
    } catch {
      if (!cancelled) {
        setError('Failed to read the report.')
      }
    } finally {
      if (!cancelled) setLoading(false)
    }
    return () => {
      cancelled = true
    }
  }, [searchParams])

  if (loading) {
    return <LoadingState />
  }

  if (error || !report) {
    return <ErrorState message={error ?? 'Unknown error.'} />
  }

  const { report_metadata: metadata } = report

  const metaItems = [
    {
      icon: <FileText className="w-3.5 h-3.5" />,
      label: `${metadata.sources_analyzed} sources`,
    },
    {
      icon: <Lightbulb className="w-3.5 h-3.5" />,
      label: `${metadata.insights_extracted} insights`,
    },
    {
      icon: <Layers className="w-3.5 h-3.5" />,
      label: `${metadata.themes_identified} themes`,
    },
    { label: isDemo ? 'Sample report' : formatDate(metadata.generated_at) },
  ]

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '20%',
            top: '-5%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.08), transparent 70%)',
          }}
        />
        <div className="absolute inset-0 bg-dotgrid opacity-20 mask-fade-b" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          <TableOfContents />
          <div className="flex-1 min-w-0">
            <motion.section
              id="report-cover"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-14"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-success/30 bg-success/10 text-success text-[11px] uppercase tracking-editorial-wide mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle" />
                {isDemo ? 'Sample report · demo data' : 'Step 03 · Synthesis complete'}
              </div>
              <h1 className="editorial-display text-display-lg text-text-primary text-balance">
                {metadata.project_name}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
                  {metaItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      {item.icon}
                      <span className="font-mono text-[12px]">{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="no-print flex items-center gap-2">
                  <ShareButton reportId={reportId} />
                  <ExportButton />
                </div>
              </div>

              <div className="mt-7 editorial-rule" />
            </motion.section>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} id="executive-summary">
              <ExecutiveSummary summary={report.executive_summary} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.15 }} id="key-findings">
              <KeyFindings findings={report.key_findings} onSourceClick={(src) => setActiveQuote({ quote: '', source: src })} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} id="segment-breakdown">
              <SegmentBreakdown breakdown={report.segment_breakdown} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.25 }} id="priority-matrix">
              <PriorityMatrix items={report.priority_matrix_data} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} id="themes">
              <ThemesList themes={report.themes} onQuoteClick={(q) => setActiveQuote(q)} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.35 }} id="recommendations">
              <Recommendations recommendations={report.recommendations} />
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.4 }} id="notable-quotes">
              <NotableQuotes quotes={report.notable_quotes} onQuoteClick={(q) => setActiveQuote(q)} />
            </motion.div>

            {sourceFiles.length > 0 && (
              <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.45 }} id="sources">
                <section className="mb-16">
                  <div className="flex items-baseline justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-secondary">
                        <FolderOpen className="w-4 h-4" />
                      </span>
                      <h2 className="text-xs font-semibold uppercase tracking-editorial-wide text-text-secondary">
                        Sources Analyzed
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-text-muted">
                      {sourceFiles.length} files
                    </span>
                  </div>
                  <div className="card p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {sourceFiles.map((file, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveQuote({ quote: '', source: file.name })}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-background border border-border text-sm group hover:border-accent/30 transition-colors text-left"
                        >
                          <FileText className="w-3.5 h-3.5 text-text-muted group-hover:text-accent flex-shrink-0 transition-colors" />
                          <span className="text-text-primary truncate font-mono text-xs flex-1">
                            {file.name}
                          </span>
                          <span className="text-xs text-text-muted flex-shrink-0 font-mono">
                            {file.size}
                          </span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-text-muted mt-4 leading-relaxed">
                      Every finding, theme, and recommendation in this report is
                      traceable to one or more of the sources listed above. Click a
                      file to inspect its contents in the source viewer.
                    </p>
                  </div>
                </section>
              </motion.div>
            )}

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.5 }} id="interrogate">
              <Interrogation report={report} />
            </motion.div>

            {/* Closing footer mark */}
            <div className="mt-20 mb-8 flex items-center justify-center gap-3 text-text-muted">
              <span className="text-accent">
                <TelescopeMark className="w-5 h-5" />
              </span>
              <span className="text-xs font-mono uppercase tracking-editorial-wide">
                End of report · Telescope v0.1
              </span>
            </div>
          </div>
        </div>
      </div>

      <ScrollToTop />

      <AnimatePresence>
        {activeQuote && (
          <SourceViewer
            quote={activeQuote.quote || null}
            source={activeQuote.source}
            speaker={activeQuote.speaker}
            context={activeQuote.context}
            files={sourceFiles.map((f) => f.name)}
            onClose={() => setActiveQuote(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReportPageContent />
    </Suspense>
  )
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-xl bg-accent text-background flex items-center justify-center shadow-elev-2 hover:bg-accent-hover transition-colors"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}