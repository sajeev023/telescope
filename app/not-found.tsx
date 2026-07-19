'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Compass, Home, Upload } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '30%',
            top: '15%',
            width: '50%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.08), transparent 70%)',
          }}
        />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 mb-6 text-accent">
          <Compass className="w-8 h-8" />
        </div>
        <p className="eyebrow justify-center mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          404 · Out of frame
        </p>
        <h1 className="editorial-display text-3xl text-text-primary mb-3">
          This page drifted off the lens.
        </h1>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          The URL you opened doesn&apos;t correspond to a real route. Either the
          link is wrong, or the report you&apos;re looking for is no longer in
          this browser&apos;s local storage.
        </p>
        <div className="flex items-center justify-center gap-2">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Go home
          </Link>
          <Link href="/upload" className="btn-ghost">
            <Upload className="w-4 h-4" />
            Start a report
          </Link>
        </div>
      </motion.div>
    </div>
  )
}