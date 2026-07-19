import { TelescopeMark } from '@/components/site/Logo'

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface border border-border text-accent mb-4 animate-pulse-subtle">
          <TelescopeMark className="w-6 h-6" />
        </div>
        <p className="text-sm text-text-secondary">Loading…</p>
      </div>
    </div>
  )
}