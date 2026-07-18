import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Telescope - AI Research Synthesis',
  description: 'Advanced AI-powered research synthesis and analysis tool',
}

function TelescopeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6"
    >
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="7" r="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7L15 12M12 7L9 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="19" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className={`${inter.className} bg-background text-text-primary antialiased`}>
        <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent-hover">
                <TelescopeIcon />
              </div>
              <span className="text-lg font-semibold text-text-primary">
                Telescope
              </span>
            </div>
            <div className="text-sm text-text-secondary">
              FlowBoard Research · July 2026
            </div>
          </div>
        </nav>
        <main className="flex-1 pt-14">
          {children}
        </main>
      </body>
    </html>
  )
}
