'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-error/10 mb-6">
          <AlertCircle className="w-8 h-8 text-error" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          An unexpected error occurred. This is likely temporary — try again or
          return to the home page.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-primary"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link href="/" className="btn-ghost">
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
