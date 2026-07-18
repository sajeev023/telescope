'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Sparkles,
  FileText,
  Lightbulb,
  Layers,
  Loader2,
  AlertCircle,
  Upload,
} from 'lucide-react'
import {
  getStoredReport,
  saveReport,
  getReport,
} from '@/lib/data'
import type { Report } from '@/types/report'
import { ExecutiveSummary } from '@/components/report/ExecutiveSummary'
import { KeyFindings } from '@/components/report/KeyFindings'
import { SegmentBreakdown } from '@/components/report/SegmentBreakdown'
import { PriorityMatrix } from '@/components/report/PriorityMatrix'
import { ThemesList } from '@/components/report/ThemesList'
import { Recommendations } from '@/components/report/Recommendations'
import { NotableQuotes } from '@/components/report/NotableQuotes'
import { Interrogation } from '@/components/report/Interrogation'

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.5 },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function LoadingState() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
          <Loader2 className="w-7 h-7 text-accent animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          Loading report
        </h2>
        <p className="text-sm text-text-secondary">
          Reading your synthesized report from session…
        </p>
      </motion.div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-error/10 mb-4">
          <AlertCircle className="w-7 h-7 text-error" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          No report found
        </h2>
        <p className="text-sm text-text-secondary mb-6">{message}</p>
        <div className="flex items-center justify-center gap-2">
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Go to Upload
          </Link>
          <button
            type="button"
            onClick={() => {
              saveReport(getReport())
              window.location.reload()
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:border-accent/40 text-text-primary text-sm font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Load demo report
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ReportPage() {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // Defer one tick so the loading state can paint before sessionStorage read
    const t = setTimeout(() => {
      try {
        const stored = getStoredReport()
        if (cancelled) return
        if (stored) {
          setReport(stored)
        } else {
          setError(
            'Run an analysis from the upload page first, or load the demo report below.'
          )
        }
      } catch {
        if (!cancelled) {
          setError('Failed to read the report from session storage.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 50)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [])

  if (loading) {
    return <LoadingState />
  }

  if (error || !report) {
    return <ErrorState message={error ?? 'Unknown error.'} />
  }

  const { report_metadata: metadata } = report

  const metaItems = [
    { icon: <FileText className="w-3.5 h-3.5" />, label: `${metadata.sources_analyzed} sources` },
    { icon: <Lightbulb className="w-3.5 h-3.5" />, label: `${metadata.insights_extracted} insights` },
    { icon: <Layers className="w-3.5 h-3.5" />, label: `${metadata.themes_identified} themes` },
    { label: formatDate(metadata.generated_at) },
  ]

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-success/10 border border-success/20 text-success text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analysis complete</span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-3">
            {metadata.project_name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
            {metaItems.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.1 }}>
          <ExecutiveSummary summary={report.executive_summary} />
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.2 }}>
          <KeyFindings findings={report.key_findings} />
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.3 }}>
          <SegmentBreakdown breakdown={report.segment_breakdown} />
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.4 }}>
          <PriorityMatrix items={report.priority_matrix_data} />
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.5 }}>
          <ThemesList themes={report.themes} />
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.6 }}>
          <Recommendations recommendations={report.recommendations} />
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.7 }}>
          <NotableQuotes quotes={report.notable_quotes} />
        </motion.div>

        <motion.div {...fadeUp} transition={{ duration: 0.5, delay: 0.8 }}>
          <Interrogation report={report} />
        </motion.div>
      </div>
    </div>
  )
}