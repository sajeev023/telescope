'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Sparkles, Send, Zap, Square, User } from 'lucide-react'
import type { Report, Segment } from '@/types/report'
import { SectionHeading, SegmentBadge } from './SegmentBadge'
import { TelescopeMark } from '@/components/site/Logo'

type Message = {
  id: number
  role: 'user' | 'ai'
  text: string
  segment?: Segment
}

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

export function Interrogation({ report }: { report: Report }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)

  const presetQuestions = useMemo(() => {
    const segments = report.segment_breakdown
    const questions: Array<{ q: string; segment: Segment }> = []

    if (segments?.enterprise) {
      questions.push({
        q: 'What about enterprise users specifically?',
        segment: 'enterprise' as Segment,
      })
    }
    if (segments?.smb) {
      questions.push({
        q: "What's the biggest problem for SMBs?",
        segment: 'smb' as Segment,
      })
    }
    if (segments?.freelancer) {
      questions.push({
        q: 'How do freelancers feel about the product?',
        segment: 'freelancer' as Segment,
      })
    }
    if (report.recommendations?.length > 0) {
      const firstSeg = (report.report_metadata.segments_detected?.[0] || 'general') as Segment
      questions.push({
        q: 'What should we build first?',
        segment: firstSeg,
      })
    }

    return questions
  }, [report])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  const streamResponse = useCallback(
    async (question: string) => {
      const aiMsgId = ++idRef.current
      setMessages((m) => [...m, { id: aiMsgId, role: 'ai', text: '' }])
      setIsTyping(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const response = await fetch('/api/interrogate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ report, question }),
          signal: controller.signal,
        })

        if (!response.ok || !response.body) {
          throw new Error(`API returned ${response.status}`)
        }

        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let accumulated = ''

        while (!controller.signal.aborted) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed.startsWith(':')) continue

            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.slice(5).trim()
              try {
                const parsed = JSON.parse(dataStr)
                if (parsed.error) {
                  accumulated = `Error: ${parsed.error}`
                } else if (parsed.text) {
                  accumulated += parsed.text
                }
                setMessages((m) =>
                  m.map((msg) =>
                    msg.id === aiMsgId ? { ...msg, text: accumulated } : msg
                  )
                )
                if (parsed.done) break
              } catch {
                /* ignore non-JSON */
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setMessages((m) =>
          m.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  text: 'Sorry, I was unable to process that question. Please try again.',
                }
              : msg
          )
        )
      } finally {
        setIsTyping(false)
        abortRef.current = null
      }
    },
    [report]
  )

  const respondTo = useCallback(
    (q: string) => {
      const userMsg: Message = {
        id: ++idRef.current,
        role: 'user',
        text: q,
      }
      setMessages((m) => [...m, userMsg])
      setInput('')
      streamResponse(q)
    },
    [streamResponse]
  )

  const handlePreset = (q: string) => {
    respondTo(q)
  }

  const handleStop = useCallback(() => {
    abortRef.current?.abort()
    setIsTyping(false)
  }, [])

  const handleSend = () => {
    const q = input.trim()
    if (!q || isTyping) return
    respondTo(q)
  }

  return (
    <section className="mb-16">
      <SectionHeading
        icon={<MessageCircle className="w-4 h-4" />}
        label="Interrogate the Report"
        index="08"
      />
      <div className="card-raised p-6 lg:p-7 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between mb-5">
          <div className="flex flex-wrap gap-2">
            {presetQuestions.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePreset(p.q)}
                disabled={isTyping}
                className="text-xs px-3.5 py-1.5 rounded-full border border-border bg-surface-raised text-text-secondary hover:text-text-primary hover:border-accent/40 transition-colors disabled:opacity-50"
              >
                {p.q}
              </button>
            ))}
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/20 text-accent text-[10px] font-medium flex-shrink-0 ml-2 uppercase tracking-editorial-wide">
            <Zap className="w-3 h-3" />
            AI-Powered
          </div>
        </div>

        <div
          ref={scrollRef}
          className="relative min-h-[320px] max-h-[60vh] overflow-y-auto rounded-xl bg-background border border-border p-4 space-y-4 mb-4 no-scrollbar"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3">
              <span className="text-accent">
                <TelescopeMark className="w-7 h-7" />
              </span>
              <p className="text-sm text-text-muted max-w-xs">
                Ask a question above, or type your own below. Answers are
                grounded in this report — Telescope will not invent new
                evidence.
              </p>
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    m.role === 'user'
                      ? 'bg-surface-raised text-text-primary border border-border'
                      : 'bg-accent text-background'
                  }`}
                >
                  {m.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'bg-surface-raised border border-border text-text-primary'
                      : 'bg-surface-raised border border-accent/30 text-text-primary'
                  }`}
                >
                  {m.segment && (
                    <div className="mb-2">
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-background">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-surface-raised border border-accent/30">
                <TypingDots />
              </div>
            </motion.div>
          )}
        </div>

        <div className="relative flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend()
            }}
            placeholder="Ask your own question…"
            className="flex-1 bg-background border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 focus:shadow-glow-accent transition-all"
          />
          {isTyping ? (
            <button
              type="button"
              onClick={handleStop}
              className="px-4 py-3 rounded-xl bg-error/10 hover:bg-error/20 border border-error/30 text-error transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <Square className="w-3.5 h-3.5" />
              Stop
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="btn-primary !px-5 disabled:opacity-50 disabled:hover:shadow-none"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          )}
        </div>
      </div>
    </section>
  )
}