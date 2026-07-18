'use client'

export function ReportHeader({ title }: { title: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-text-primary mb-2">{title}</h1>
      <p className="text-text-secondary">Comprehensive research synthesis and analysis</p>
    </div>
  )
}
