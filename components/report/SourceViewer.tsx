'use client'

import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, Search, AlertCircle } from 'lucide-react'

type Props = {
  /** Quote to highlight inside the source. Empty string means no highlight. */
  quote: string | null
  /** Preferred source filename to open first. */
  source?: string
  speaker?: string
  context?: string
  /** Names of source files available in sessionStorage. */
  files: string[]
  onClose: () => void
}

const DEMO_PATH_PREFIX = '/demo/'

function isDemoFile(name: string): boolean {
  return /^(interview-|call-|meeting-)/.test(name) && /\.(txt|md)$/i.test(name)
}

async function loadFileContent(name: string): Promise<string | null> {
  // Tier 1 — in-memory sessionStorage (just-generated report)
  try {
    const raw = sessionStorage.getItem('telescope:files')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        const found = parsed.find(
          (f: { name?: string; content?: string }) => f.name === name,
        )
        if (found && typeof found.content === 'string') return found.content
      }
    }
  } catch {
    /* ignore */
  }
  // Tier 2 — fetch from /demo (shared URL or demo report)
  if (isDemoFile(name)) {
    try {
      const res = await fetch(`${DEMO_PATH_PREFIX}${name}`)
      if (res.ok) return await res.text()
    } catch {
      /* ignore */
    }
  }
  return null
}

function highlightContent(content: string, quote: string | null) {
  if (!quote || quote.length < 8) {
    return [{ text: content, highlight: false }]
  }
  // Normalize whitespace in both the content and the quote so a quote
  // that spans line breaks in the source can still be matched.
  const normalize = (s: string) => s.replace(/\s+/g, ' ').trim()
  const normalizedContent = normalize(content)
  const normalizedQuote = normalize(quote)
  // Find a case-insensitive match in the normalized content, then
  // map the match back to the original content by walking characters
  // and collapsing whitespace runs into a single space.
  const lower = normalizedContent.toLowerCase()
  const needle = normalizedQuote.toLowerCase()
  const idx = lower.indexOf(needle)
  if (idx === -1) return [{ text: content, highlight: false }]

  // Build a map: position in normalized content -> position in original.
  const positions: number[] = []
  let orig = 0
  for (let i = 0; i < normalizedContent.length; i++) {
    while (orig < content.length && /\s/.test(content[orig])) {
      orig++
    }
    positions.push(orig)
    orig++
  }
  const startOrig = positions[idx] ?? 0
  const endOrig = positions[idx + normalizedQuote.length - 1] ?? content.length

  return [
    { text: content.slice(0, startOrig), highlight: false },
    { text: content.slice(startOrig, endOrig + 1), highlight: true },
    { text: content.slice(endOrig + 1), highlight: false },
  ]
}

export function SourceViewer({
  quote,
  source,
  speaker,
  context,
  files,
  onClose,
}: Props) {
  const [fileList, setFileList] = useState<string[]>(files)
  const [activeName, setActiveName] = useState<string | null>(source ?? files[0] ?? null)
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [query, setQuery] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<Element | null>(null)

  // Pull files from sessionStorage on mount if not passed in (shared URL case)
  useEffect(() => {
    if (files.length > 0) return
    try {
      const raw = sessionStorage.getItem('telescope:files')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          const names = parsed
            .map((f: { name?: string }) => f.name)
            .filter((n: unknown): n is string => typeof n === 'string')
          setFileList(names)
          if (!activeName && names.length > 0) setActiveName(names[0])
        }
      }
    } catch {
      /* ignore */
    }
  }, [files, activeName])

  // When no source is provided but we have a quote, scan sessionStorage
  // files for one that contains the quote text and auto-select it.
  useEffect(() => {
    if (!quote || source || !fileList.length) return
    let cancelled = false
    const normalized = quote.replace(/\s+/g, ' ').trim().toLowerCase()
    if (normalized.length < 8) return
    try {
      const raw = sessionStorage.getItem('telescope:files')
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      const found = parsed.find((f: { content?: string }) => {
        if (typeof f.content !== 'string') return false
        return f.content.replace(/\s+/g, ' ').toLowerCase().includes(normalized)
      })
      if (found?.name && !cancelled) setActiveName(found.name)
    } catch {
      /* ignore */
    }
    return () => {
      cancelled = true
    }
  }, [quote, source, fileList])

  // Escape closes the modal. Focus starts on the close button.
  // Focus is trapped inside the dialog while it's open.
  useEffect(() => {
    triggerRef.current = document.activeElement
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      // Restore focus to the element that opened the modal.
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
    }
  }, [onClose])

  // Load active file content when it changes.
  useEffect(() => {
    let cancelled = false
    if (!activeName) {
      setContent(null)
      setNotFound(false)
      return
    }
    setLoading(true)
    setContent(null)
    setNotFound(false)
    loadFileContent(activeName).then((c) => {
      if (cancelled) return
      setLoading(false)
      if (c === null) setNotFound(true)
      else setContent(c)
    })
    return () => {
      cancelled = true
    }
  }, [activeName])

  const segments = useMemo(
    () => (content ? highlightContent(content, quote) : []),
    [content, quote],
  )

  const filteredFiles = useMemo(
    () =>
      query
        ? fileList.filter((n) => n.toLowerCase().includes(query.toLowerCase()))
        : fileList,
    [fileList, query],
  )

  const selectFile = useCallback((name: string) => {
    setActiveName(name)
  }, [])

  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 sm:p-6 no-print"
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-viewer-title"
    >
      <motion.div
        ref={dialogRef}
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-5xl max-h-[88vh] rounded-2xl bg-surface border border-border shadow-elev-3 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent flex-shrink-0" />
              <h2 id="source-viewer-title" className="text-sm font-semibold text-text-primary truncate">
                {activeName ?? 'Source viewer'}
              </h2>
            </div>
            {(speaker || context) && (
              <p className="text-xs text-text-muted mt-1 font-mono truncate">
                {speaker ? `Speaker: ${speaker}` : ''}
                {speaker && context ? ' · ' : ''}
                {context || ''}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-lg border border-border bg-surface-raised flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent/30 transition-colors"
            aria-label="Close source viewer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body — file list + content */}
        <div className="flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-[220px_1fr] divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Sidebar — files */}
          <div className="flex flex-col min-h-0 max-h-[200px] sm:max-h-none">
            <div className="p-3 border-b border-border flex-shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter sources"
                  className="w-full pl-8 pr-3 py-1.5 rounded-md bg-background border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
                  aria-label="Filter source files"
                />
              </div>
            </div>
            <ul className="overflow-y-auto flex-1 py-1">
              {filteredFiles.length === 0 && (
                <li className="px-3 py-4 text-xs text-text-muted text-center">
                  No files match
                </li>
              )}
              {filteredFiles.map((name) => {
                const active = name === activeName
                return (
                  <li key={name}>
                    <button
                      type="button"
                      onClick={() => selectFile(name)}
                      className={`w-full text-left px-3 py-2 text-xs font-mono truncate transition-colors ${
                        active
                          ? 'bg-accent/10 text-accent border-l-2 border-accent'
                          : 'text-text-secondary hover:bg-surface-raised border-l-2 border-transparent'
                      }`}
                    >
                      {name}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Content pane */}
          <div className="min-h-0 overflow-y-auto p-5 bg-background/40">
            {loading && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <div className="w-3 h-3 rounded-full border-2 border-accent/40 border-t-accent animate-spin" />
                Loading source…
              </div>
            )}
            {notFound && !loading && (
              <div className="flex items-start gap-2 text-xs text-text-secondary p-4 rounded-lg bg-error/5 border border-error/20">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-text-primary mb-1">
                    Source not available
                  </p>
                  <p className="leading-relaxed">
                    This source file was uploaded for the original analysis and
                    isn&apos;t available in this browser session. If you opened
                    this report via a shared URL, only the demo transcripts can
                    be inspected.
                  </p>
                </div>
              </div>
            )}
            {!loading && !notFound && content && (
              <>
                {quote && (
                  <div className="mb-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="text-[10px] uppercase tracking-editorial-wide text-accent mb-1">
                      Quote in context
                    </p>
                    <p className="text-sm italic font-serif text-text-primary leading-relaxed">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </div>
                )}
                <pre className="text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed">
                  {segments.map((seg, i) =>
                    seg.highlight ? (
                      <mark
                        key={i}
                        className="bg-accent/30 text-text-primary rounded px-0.5 -mx-0.5"
                      >
                        {seg.text}
                      </mark>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    ),
                  )}
                </pre>
              </>
            )}
            {!loading && !notFound && !content && !quote && (
              <div className="text-xs text-text-muted">
                Select a source file from the sidebar to inspect its contents.
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}