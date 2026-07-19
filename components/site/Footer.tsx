import Link from 'next/link'
import { Logo } from './Logo'
import { TelescopeMark } from './Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/40">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 md:col-span-2">
            <Logo />
            <p className="text-sm text-text-secondary mt-5 max-w-xs leading-relaxed">
              Turn customer conversations into actionable, evidence-backed
              insight — without reading every transcript yourself.
            </p>
            <div className="mt-6 text-[11px] uppercase tracking-editorial-wide text-text-muted">
              Hackathon preview · July 2026
            </div>
          </div>

          <FooterCol
            title="Project"
            links={[
              { href: '/upload', label: 'Upload' },
              { href: '/#product', label: 'Features' },
              { href: '/#workflow', label: 'AI Pipeline' },
              { href: '/#architecture', label: 'Architecture' },
            ]}
          />
          <FooterCol
            title="Resources"
            links={[
              { href: '/#testimonials', label: 'Principles' },
              { href: '/#faq', label: 'FAQ' },
              { href: '/#techstack', label: 'Tech Stack' },
            ]}
          />
          <FooterCol
            title="Hackathon"
            links={[
              { href: '/report?demo=1', label: 'Sample Report' },
              { href: '/upload', label: 'Try It Yourself' },
            ]}
          />
        </div>

        <div className="editorial-rule mb-8" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-[12px] text-text-muted">
          <div className="flex items-center gap-3">
            <span className="text-accent">
              <TelescopeMark className="w-4 h-4" />
            </span>
            <span>© 2026 Telescope · Hackathon Showcase</span>
            <span className="hidden md:inline text-border">·</span>
            <span className="hidden md:inline">Built for the FlowBoard Hackathon · July 2026</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px]">v0.1.0 · Telescope</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: Array<{ href: string; label: string }>
}) {
  return (
    <div>
      <p className="eyebrow mb-4">{title}</p>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}