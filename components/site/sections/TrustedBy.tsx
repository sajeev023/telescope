'use client'

import { motion } from 'framer-motion'
import { Reveal } from '../Reveal'

const PERSONAS = [
  'Product Managers',
  'UX Researchers',
  'Founders',
  'Customer Success',
  'Designers',
  'Revenue Teams',
]

export function TrustedBy() {
  return (
    <section className="py-16 lg:py-20 border-y border-border/60 bg-surface/20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <Reveal>
          <p className="eyebrow justify-center text-center">
            Built for the people closest to the customer
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {PERSONAS.map((p, i) => (
            <motion.span
              key={p}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="font-serif text-2xl text-text-muted hover:text-text-primary transition-colors"
            >
              {p}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}