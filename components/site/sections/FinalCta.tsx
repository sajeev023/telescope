'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
import { TelescopeMark } from '../Logo'

export function FinalCta() {
  return (
    <section id="contact" className="py-28 lg:py-40 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora"
          style={{
            left: '20%',
            top: '20%',
            width: '60%',
            height: '70%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.18), transparent 70%)',
          }}
        />
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            right: '15%',
            bottom: '10%',
            width: '45%',
            height: '55%',
            background: 'radial-gradient(circle, rgba(155,123,216,0.12), transparent 70%)',
          }}
        />
        <div className="absolute inset-0 bg-dotgrid opacity-30" />
      </div>

      <div className="max-w-[1100px] mx-auto px-6 lg:px-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full border border-accent/30 bg-accent/5 text-accent mb-10"
        >
          <TelescopeMark className="w-8 h-8" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="editorial-display text-display-xl text-text-primary text-balance"
        >
          Your next research report is{' '}
          <span className="serif-italic text-accent">already</span> on your hard
          drive.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg text-text-secondary mt-6 max-w-xl mx-auto text-pretty"
        >
          It&apos;s sitting in a folder called &ldquo;calls.&rdquo; Upload it.
          Watch Telescope turn it into something you can act on.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/upload" className="btn-primary !text-[15px] !py-4 !px-7">
            <Sparkles className="w-4 h-4" />
            Upload your first transcript
            <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link href="/report?demo=1" className="btn-ghost !text-[15px] !py-4 !px-7">
            See a sample report
          </Link>
        </motion.div>
      </div>
    </section>
  )
}