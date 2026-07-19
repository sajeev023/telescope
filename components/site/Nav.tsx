'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight } from 'lucide-react'
import { Logo } from './Logo'

const NAV_LINKS = [
  { href: '/#product', label: 'Overview' },
  { href: '/#workflow', label: 'AI Pipeline' },
  { href: '/#architecture', label: 'Architecture' },
  { href: '/#faq', label: 'FAQ' },
]

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-editorial ${
        scrolled
          ? 'bg-background/70 backdrop-blur-xl border-b border-border/60'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="group" aria-label="Telescope home">
          <Logo />
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-3.5 py-2 text-[13px] text-text-secondary hover:text-text-primary transition-colors rounded-md hover:bg-surface/60"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/report?demo=1"
            className="text-[13px] text-text-secondary hover:text-text-primary px-3.5 py-2 transition-colors"
          >
            Sample report
          </Link>
          <Link href="/upload" className="btn-primary !py-2 !px-4 text-[13px]">
            Open Telescope
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="md:hidden p-2 -mr-2 text-text-primary"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-text-secondary hover:text-text-primary"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/report?demo=1"
                onClick={() => setOpen(false)}
                className="text-text-secondary hover:text-text-primary py-2.5"
              >
                Sample report
              </Link>
              <Link
                href="/upload"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2"
              >
                Open Telescope
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}