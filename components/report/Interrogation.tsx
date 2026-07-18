'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Sparkles, Send } from 'lucide-react'
import type { Report, Segment } from '@/types/report'
import { SectionHeading, SegmentBadge } from './SegmentBadge'

type Message = {
  id: number
  role: 'user' | 'ai'
  text: string
  segment?: Segment
}

const TYPING_DELAY = 1500

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-accent"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

function generateAnswer(q: string, report: Report): { answer: string; segment?: Segment } {
  const lower = q.toLowerCase()

  // Enterprise-specific questions
  if (lower.includes('enterprise')) {
    const enterpriseProfile = report.segment_breakdown?.enterprise
    const enterpriseThemes = report.themes?.filter((t) =>
      t.affected_segments.includes('enterprise')
    )
    const enterpriseFindings = report.key_findings?.filter((f) =>
      f.affected_segments.includes('enterprise')
    )

    const parts: string[] = []
    if (enterpriseProfile?.top_concern) {
      parts.push(`The top concern for enterprise users is: ${enterpriseProfile.top_concern}`)
    }
    if (enterpriseProfile?.summary) {
      parts.push(enterpriseProfile.summary)
    }
    if (enterpriseFindings && enterpriseFindings.length > 0) {
      parts.push(`Key finding: ${enterpriseFindings[0].finding}`)
    }
    if (enterpriseThemes && enterpriseThemes.length > 0) {
      const criticalThemes = enterpriseThemes.filter((t) => t.severity === 'critical')
      if (criticalThemes.length > 0) {
        parts.push(`Critical themes: ${criticalThemes.map((t) => t.name).join(', ')}.`)
      }
    }
    return { answer: parts.join(' ') || 'No enterprise-specific data in this report.', segment: 'enterprise' }
  }

  // SMB-specific questions
  if (lower.includes('smb')) {
    const smbProfile = report.segment_breakdown?.smb
    const smbThemes = report.themes?.filter((t) =>
      t.affected_segments.includes('smb')
    )
    const smbFindings = report.key_findings?.filter((f) =>
      f.affected_segments.includes('smb')
    )

    const parts: string[] = []
    if (smbProfile?.top_concern) {
      parts.push(`The top concern for SMB users is: ${smbProfile.top_concern}`)
    }
    if (smbProfile?.summary) {
      parts.push(smbProfile.summary)
    }
    if (smbFindings && smbFindings.length > 0) {
      parts.push(`Key finding: ${smbFindings[0].finding}`)
    }
    if (smbThemes && smbThemes.length > 0) {
      const criticalThemes = smbThemes.filter((t) => t.severity === 'critical' || t.severity === 'high')
      if (criticalThemes.length > 0) {
        parts.push(`Critical themes: ${criticalThemes.map((t) => t.name).join(', ')}.`)
      }
    }
    return { answer: parts.join(' ') || 'No SMB-specific data in this report.', segment: 'smb' }
  }

  // Freelancer-specific questions
  if (lower.includes('freelancer')) {
    const freelancerProfile = report.segment_breakdown?.freelancer
    const freelancerThemes = report.themes?.filter((t) =>
      t.affected_segments.includes('freelancer')
    )

    const parts: string[] = []
    if (freelancerProfile?.top_concern) {
      parts.push(`The top concern for freelancers is: ${freelancerProfile.top_concern}`)
    }
    if (freelancerProfile?.summary) {
      parts.push(freelancerProfile.summary)
    }
    if (freelancerThemes && freelancerThemes.length > 0) {
      parts.push(`Relevant themes: ${freelancerThemes.map((t) => t.name).join(', ')}.`)
    }
    return { answer: parts.join(' ') || 'No freelancer-specific data in this report.', segment: 'freelancer' }
  }

  // "What should we build first" or prioritization questions
  if (
    lower.includes('build first') ||
    lower.includes('priorit') ||
    lower.includes('what should') ||
    lower.includes('recommend')
  ) {
    const topRecs = report.recommendations?.slice(0, 3)
    if (topRecs && topRecs.length > 0) {
      const recTexts = topRecs.map(
        (r) => `${r.rank}. ${r.action} (${r.effort_estimate} effort, targets ${r.target_segment})`
      )
      return {
        answer: `Based on the research, the top priorities are:\n\n${recTexts.join('\n\n')}\n\n${report.executive_summary?.slice(0, 200) || ''}`,
        segment: topRecs[0].target_segment === 'all' ? undefined : (topRecs[0].target_segment as Segment),
      }
    }
  }

  // Default: summarize the report
  const summary = report.executive_summary
  const topFinding = report.key_findings?.[0]
  const parts: string[] = []
  if (summary) {
    parts.push(summary.slice(0, 400))
  }
  if (topFinding) {
    parts.push(`The #1 finding is: ${topFinding.finding}`)
  }
  return {
    answer:
      parts.join('\n\n') ||
      'The report has been generated. Try asking about a specific segment (enterprise, SMB, freelancer) or about what to build first.',
  }
}

export function Interrogation({ report }: { report: Report }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)

  const presetQuestions = useMemo(() => {
    const segments = report.segment_breakdown
    const questions: Array<{ q: string; segment: Segment }> = []

    if (segments?.enterprise) {
      questions.push({ q: 'What about enterprise users specifically?', segment: 'enterprise' as Segment })
    }
    if (segments?.smb) {
      questions.push({ q: "What's the biggest problem for SMBs?", segment: 'smb' as Segment })
    }
    if (segments?.freelancer) {
      questions.push({ q: 'How do freelancers feel about the product?', segment: 'freelancer' as Segment })
    }
    if (report.recommendations?.length > 0) {
      questions.push({ q: 'What should we build first?', segment: 'smb' as Segment })
    }

    return questions
  }, [report])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const respondTo = (q: string) => {
    const userMsg: Message = {
      id: ++idRef.current,
      role: 'user',
      text: q,
    }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setIsTyping(true)

    const { answer, segment } = generateAnswer(q, report)

    setTimeout(() => {
      const aiMsg: Message = {
        id: ++idRef.current,
        role: 'ai',
        text: answer,
        segment,
      }
      setMessages((m) => [...m, aiMsg])
      setIsTyping(false)
    }, TYPING_DELAY)
  }

  const handlePreset = (q: string) => {
    respondTo(q)
  }

  const handleSend = () => {
    const q = input.trim()
    if (!q || isTyping) return
    respondTo(q)
  }

  return (
    <section className="mb-16">
      <SectionHeading icon={<MessageCircle className="w-4 h-4" />} label="Interrogate the Report" />
      <div className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/20 transition-colors">
        <div className="flex flex-wrap gap-2 mb-4">
          {presetQuestions.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePreset(p.q)}
              disabled={isTyping}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface-raised text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors disabled:opacity-50"
            >
              {p.q}
            </button>
          ))}
        </div>

        <div
          ref={scrollRef}
          className="h-80 overflow-y-auto rounded-xl bg-background border border-border p-4 space-y-4 mb-4"
        >
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <p className="text-sm text-text-muted">
                Ask a question above, or type your own below. The AI will
                respond based on the synthesized report.
              </p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${
                  m.role === 'user' ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    m.role === 'user'
                      ? 'bg-surface-raised text-text-primary border border-border'
                      : 'bg-accent text-white'
                  }`}
                >
                  {m.role === 'user' ? 'Y' : <Sparkles className="w-4 h-4" />}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    m.role === 'user'
                      ? 'bg-surface-raised border border-border text-text-primary'
                      : 'bg-surface-raised border border-accent/30 text-text-primary'
                  }`}
                >
                  {m.segment && (
                    <div className="mb-1.5">
                      <SegmentBadge segment={m.segment} />
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {m.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-surface-raised border border-accent/30">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            placeholder="Ask your own question..."
            className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>
      </div>
    </section>
  )
}
