'use client'

import { BarChart3 } from 'lucide-react'
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { PriorityMatrixItem, Severity } from '@/types/report'
import { getSeverityColor } from '@/lib/data'
import { SectionHeading, hexAlpha } from './SegmentBadge'

type Props = {
  items: PriorityMatrixItem[]
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: PriorityMatrixItem }>
}) {
  if (!active || !payload || !payload.length) return null
  const item = payload[0].payload
  const color = getSeverityColor(item.severity)
  return (
    <div className="rounded-lg bg-surface-raised border border-border px-3 py-2 text-xs">
      <p className="font-semibold text-text-primary mb-1">
        {item.theme_name}
      </p>
      <p className="text-text-secondary">
        Importance: <span className="text-text-primary">{item.importance}/5</span>
      </p>
      <p className="text-text-secondary">
        Urgency: <span className="text-text-primary">{item.urgency}/5</span>
      </p>
      <p className="text-text-secondary">
        Insights: <span className="text-text-primary">{item.insight_count}</span>
      </p>
      <p style={{ color }} className="mt-1 uppercase tracking-wide text-[10px]">
        {item.severity}
      </p>
    </div>
  )
}

const severities: Severity[] = ['critical', 'high', 'medium', 'low']

export function PriorityMatrix({ items }: Props) {
  return (
    <section className="mb-16">
      <SectionHeading icon={<BarChart3 className="w-4 h-4" />} label="Priority Matrix" />
      <div className="rounded-2xl bg-surface border border-border p-6 hover:border-accent/20 transition-colors">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 30, bottom: 40, left: 30 }}>
              <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="urgency"
                domain={[0, 6]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: '#A0A0A0', fontSize: 12 }}
                label={{
                  value: 'Urgency →',
                  position: 'insideBottom',
                  offset: -20,
                  fill: '#A0A0A0',
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="importance"
                domain={[0, 6]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fill: '#A0A0A0', fontSize: 12 }}
                label={{
                  value: 'Importance →',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fill: '#A0A0A0',
                  fontSize: 12,
                }}
              />
              <ZAxis
                type="number"
                dataKey="insight_count"
                range={[80, 400]}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3', stroke: '#2A2A2A' }}
                content={<CustomTooltip />}
              />
              {severities.map((sev) => {
                const data = items.filter((i) => i.severity === sev)
                if (!data.length) return null
                const color = getSeverityColor(sev)
                return (
                  <Scatter
                    key={sev}
                    name={sev}
                    data={data}
                    fill={color}
                    stroke={color}
                  />
                )
              })}
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#A0A0A0' }}
                formatter={(value) => (
                  <span
                    style={{
                      color: getSeverityColor(value as Severity),
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: hexAlpha(getSeverityColor(value as Severity), 0.18),
                      textTransform: 'uppercase',
                      fontSize: 10,
                    }}
                  >
                    {value}
                  </span>
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-text-muted text-center mt-3">
          Bubble size scales with insight count. Top-right quadrant = high
          importance, high urgency.
        </p>
      </div>
    </section>
  )
}