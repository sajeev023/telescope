import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm-tinted obsidian base
        background: '#0A0A0B',
        surface: '#101012',
        'surface-raised': '#161619',
        'surface-elevated': '#1C1C20',
        border: '#26262B',
        'border-soft': '#1E1E22',
        // Warm cream text (not pure white — feels like aged paper / starlight)
        'text-primary': '#F5F1E8',
        'text-secondary': '#A7A29A',
        'text-muted': '#6E6A63',
        // Saffron amber — the singular sharp accent (sodium-light / brass instrument)
        accent: '#E8B14E',
        'accent-hover': '#F0BE5F',
        'accent-soft': '#3A2F1A',
        // Secondary — refined mauve, used sparingly
        incense: '#9B7BD8',
        // Status — warmer, more sophisticated than primaries
        success: '#7BC74D',
        warning: '#E88B4E',
        error: '#E5534B',
        info: '#6BB6D9',
      },
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Editorial display scale
        'display-2xl': ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'display-xl': ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2.25rem, 4.5vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(1.875rem, 3vw, 2.75rem)', { lineHeight: '1.1', letterSpacing: '-0.025em' }],
      },
      letterSpacing: {
        'editorial-tight': '-0.035em',
        'editorial-wide': '0.18em',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'elev-1': '0 1px 2px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
        'elev-2': '0 4px 12px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
        'elev-3': '0 12px 32px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.4)',
        'glow-accent': '0 0 0 1px rgba(232,177,78,0.15), 0 0 24px rgba(232,177,78,0.18)',
        'inner-hairline': 'inset 0 1px 0 0 rgba(245,241,232,0.04)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        'radial-fade': 'radial-gradient(ellipse at center, var(--tw-gradient-from), var(--tw-gradient-to) 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        'pulse-subtle': 'pulseSubtle 2.4s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'aurora': 'aurora 18s ease-in-out infinite',
        'aurora-slow': 'aurora 28s ease-in-out infinite',
        'spin-slow': 'spin 14s linear infinite',
        'blink': 'blink 1.2s steps(2, start) infinite',
        'scanline': 'scanline 3s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 11s ease-in-out infinite',
        'marquee': 'marquee 40s linear infinite',
        'border-draw': 'borderDraw 2s cubic-bezier(0.22, 1, 0.36, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-14px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        aurora: {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)', opacity: '0.7' },
          '33%': { transform: 'translate3d(5%, -8%, 0) scale(1.1)', opacity: '0.9' },
          '66%': { transform: 'translate3d(-4%, 6%, 0) scale(0.95)', opacity: '0.6' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        borderDraw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      transitionTimingFunction: {
        'editorial': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config