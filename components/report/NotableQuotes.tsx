'use client'

import { useState, useCallback } from 'react'
import { MessageSquare, Copy, Check } from 'lucide-react'
import type { NotableQuote as NotableQuoteType } from '@/types/report'
import { SectionHeading, SegmentBadge } from './SegmentBadge'
import { EmptyState } from './EmptyState'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }, [text])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-md bg-surface-raised border border-border text-text-muted hover:text-accent hover:border-accent/30 transition-colors opacity-0 group-hover:opacity-100"
      aria-label={copied ? 'Copied' : 'Copy quote'}
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-success" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  )
}

export function NotableQuotes({
  quotes,
  onQuoteClick,
}: {
  quotes: NotableQuoteType[]
  onQuoteClick?: (q: { quote: string; speaker: string; context: string; segment: string }) => void
}) {
  return (
    <section className="mb-16">
      <SectionHeading
        icon={<MessageSquare className="w-4 h-4" />}
        label="Notable Quotes"
        index="07"
      />
      {quotes.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-5 h-5" />}
          title="No notable quotes"
          description="No verbatim quotes were extracted from the provided documents."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotes.map((q, i) => (
            <div
              key={i}
              className="group card p-6 hover:border-accent/30 transition-colors relative overflow-hidden"
            >
              <span className="absolute top-2 right-12 text-6xl leading-none text-accent/20 font-serif select-none pointer-events-none">
                &ldquo;
              </span>
              <CopyButton text={q.quote} />
              <button
                type="button"
                onClick={() => onQuoteClick?.(q)}
                className="block text-left w-full"
                aria-label="View quote in source"
              >
                <p className="text-base italic text-text-primary leading-relaxed mb-5 pr-6 font-serif relative hover:text-accent transition-colors">
                  {q.quote}
                </p>
              </button>
              <div className="flex items-center justify-between gap-2 flex-wrap pt-4 border-t border-border">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {q.speaker}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5 font-mono">
                    {q.context}
                  </p>
                </div>
                <SegmentBadge segment={q.segment} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}