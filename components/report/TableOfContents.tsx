'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Lightbulb,
  Users,
  BarChart3,
  Layers,
  CheckCircle,
  MessageSquare,
  MessageCircle,
  ChevronDown,
  List,
} from 'lucide-react'

const SECTIONS = [
  { id: 'executive-summary', label: 'Executive Summary', icon: FileText, n: '01' },
  { id: 'key-findings', label: 'Key Findings', icon: Lightbulb, n: '02' },
  { id: 'segment-breakdown', label: 'Segment Breakdown', icon: Users, n: '03' },
  { id: 'priority-matrix', label: 'Priority Matrix', icon: BarChart3, n: '04' },
  { id: 'themes', label: 'Themes', icon: Layers, n: '05' },
  { id: 'recommendations', label: 'Recommendations', icon: CheckCircle, n: '06' },
  { id: 'notable-quotes', label: 'Notable Quotes', icon: MessageSquare, n: '07' },
  { id: 'interrogate', label: 'Interrogate', icon: MessageCircle, n: '08' },
]

function useActiveSection() {
  const [activeId, setActiveId] = useState<string>('')

  const handleScroll = useCallback(() => {
    const offsets = SECTIONS.map(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return { id, top: Infinity }
      const rect = el.getBoundingClientRect()
      return { id, top: rect.top }
    })

    const viewportHeight = window.innerHeight
    const threshold = viewportHeight * 0.3

    for (let i = offsets.length - 1; i >= 0; i--) {
      if (offsets[i].top < threshold) {
        setActiveId(offsets[i].id)
        return
      }
    }
    setActiveId(offsets[0]?.id ?? '')
  }, [])

  useEffect(() => {
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { activeId, handleScroll }
}

function TocList({
  activeId,
  onNavigate,
}: {
  activeId: string
  onNavigate: (id: string) => void
}) {
  return (
    <ul className="space-y-0.5">
      {SECTIONS.map(({ id, label, icon: Icon, n }) => {
        const isActive = activeId === id
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onNavigate(id)}
              className={`group w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'text-text-primary bg-surface-raised border border-border'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface/60 border border-transparent'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 flex-shrink-0 ${
                  isActive ? 'text-accent' : 'text-text-muted group-hover:text-text-secondary'
                }`}
              />
              <span className="truncate flex-1">{label}</span>
              <span
                className={`text-xs font-mono ${
                  isActive ? 'text-accent' : 'text-text-muted'
                }`}
              >
                {n}
              </span>
              {isActive && (
                <motion.div
                  layoutId="toc-indicator"
                  className="absolute left-0 w-0.5 h-5 rounded-full bg-accent"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function TableOfContents() {
  const { activeId } = useActiveSection()
  const [mobileOpen, setMobileOpen] = useState(false)

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMobileOpen(false)
  }, [])

  const activeLabel =
    SECTIONS.find((s) => s.id === activeId)?.label ?? 'On this page'

  return (
    <>
      {/* Desktop — sticky sidebar */}
      <nav
        aria-label="On this page"
        className="hidden lg:block sticky top-24 w-60 flex-shrink-0 self-start max-h-[calc(100vh-8rem)] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-center gap-2 mb-4 px-2">
          <span className="w-1 h-1 rounded-full bg-accent" />
          <p className="text-xs uppercase tracking-editorial-wide text-text-muted">
            On this page
          </p>
        </div>
        <TocList activeId={activeId} onNavigate={scrollTo} />
      </nav>

      {/* Mobile — collapsible drawer inline above the report */}
      <div className="lg:hidden mb-6 no-print">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-toc"
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text-primary"
        >
          <span className="flex items-center gap-2">
            <List className="w-4 h-4 text-accent" />
            <span>{activeLabel}</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-text-muted transition-transform ${
              mobileOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              id="mobile-toc"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden mt-2"
            >
              <div className="rounded-xl bg-surface border border-border p-2">
                <TocList activeId={activeId} onNavigate={scrollTo} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}