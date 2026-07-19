'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function Reveal({
  children,
  delay = 0,
  y = 18,
  className = '',
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  once?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SectionLabel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`eyebrow ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
      {children}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  eyebrow: string
  title: ReactNode
  subtitle?: ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
      <SectionLabel className={align === 'center' ? 'justify-center' : ''}>
        {eyebrow}
      </SectionLabel>
      <h2 className="editorial-display text-display-md mt-5 text-text-primary text-balance">
        {title}
      </h2>
      {subtitle && (
        <p className="text-text-secondary text-base mt-4 leading-relaxed text-pretty">
          {subtitle}
        </p>
      )}
    </div>
  )
}