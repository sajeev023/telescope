'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles, Play, Loader2, FileText } from 'lucide-react'
import { HeroInstrument } from '../HeroInstrument'
import { CursorSpotlight } from '../Cursor'
import { saveFiles } from '@/lib/storage'
import { loadDemoFiles } from '@/lib/demo'

export function Hero() {
  const router = useRouter()
  const [loadingDemo, setLoadingDemo] = useState(false)
  const [loadingSample, setLoadingSample] = useState(false)

  const loadDemo = useCallback(async () => {
    setLoadingDemo(true)
    try {
      const results = await loadDemoFiles()
      saveFiles(results)
      router.push('/thinking')
    } catch {
      router.push('/upload')
    } finally {
      setLoadingDemo(false)
    }
  }, [router])

  const viewSample = useCallback(() => {
    setLoadingSample(true)
    router.push('/report?demo=1')
  }, [router])

  return (
    <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32">
      <CursorSpotlight />

      {/* Aurora background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '5%',
            top: '10%',
            width: '40%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.18), transparent 70%)',
          }}
        />
        <div
          className="aurora-glow animate-aurora"
          style={{
            right: '5%',
            bottom: '10%',
            width: '45%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(155,123,216,0.12), transparent 70%)',
          }}
        />
        <div className="absolute inset-0 bg-dotgrid opacity-40 mask-fade-b" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left — copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur-sm text-xs uppercase tracking-editorial-wide text-text-secondary"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              AI Research Synthesis · Hackathon Project Showcase
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="editorial-display text-display-2xl mt-7 text-text-primary text-balance"
            >
              Turn customer conversations into{' '}
              <span className="serif-italic text-accent">actionable</span>{' '}
              insight.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg text-text-secondary mt-6 max-w-xl leading-relaxed text-pretty"
            >
              Telescope reads every interview, support call, and meeting note —
              clusters them by theme, extracts evidence-backed quotes, and
              produces a boardroom-ready report.{' '}
              <span className="text-text-primary">Evidence over opinions.</span>{' '}
              <span className="text-text-primary">Trust over hallucination.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link href="/upload" className="btn-primary !text-sm !py-3.5 !px-6">
                <Sparkles className="w-4 h-4" />
                Upload transcripts
                <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={loadDemo}
                disabled={loadingDemo}
                className="btn-ghost !text-sm !py-3.5 !px-6 disabled:opacity-60"
              >
                {loadingDemo ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading demo…
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Run live demo
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={viewSample}
                disabled={loadingSample}
                className="text-sm text-text-secondary hover:text-accent transition-colors inline-flex items-center gap-1.5 px-2 py-2 disabled:opacity-60"
              >
                {loadingSample ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                View sample report
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 grid grid-cols-3 gap-6 max-w-md"
            >
              <Stat value="3" label="Real pipeline calls" />
              <Stat value="100%" label="Evidence-backed" />
              <Stat value="100%" label="Source-traceable" />
            </motion.div>
          </div>

          {/* Right — instrument */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroInstrument />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="editorial-display text-3xl text-text-primary tabular-nums">
        {value}
      </div>
      <div className="text-xs uppercase tracking-editorial-wide text-text-muted mt-1">
        {label}
      </div>
    </div>
  )
}