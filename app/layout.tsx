import type { Metadata } from 'next'
import { Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SiteNav } from '@/components/site/Nav'
import { SiteFooter } from '@/components/site/Footer'

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Telescope — Turn customer conversations into actionable insight',
  description:
    'Telescope is an AI-powered research synthesis platform. Upload interviews, support calls, and notes — Telescope reads, clusters, and produces boardroom-ready reports.',
  metadataBase: new URL('https://telescope.research'),
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'Telescope — Turn customer conversations into actionable insight',
    description:
      'AI-powered research synthesis. Evidence over opinions. Trust over hallucination.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Telescope — AI Research Synthesis',
    description:
      'AI-powered research synthesis. Evidence over opinions. Trust over hallucination.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`dark ${interTight.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <SiteNav />
        <main id="main-content" className="flex-1 pt-16">{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}