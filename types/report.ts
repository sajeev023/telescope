export type Segment = 'smb' | 'enterprise' | 'freelancer' | 'general'

// `positive` is a severity value used for strengths / retention drivers /
// moats — findings that are not problems but still need to surface in the
// report. It is a first-class severity, not an absence of severity.
export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'positive'

export type Effort = 'low' | 'medium' | 'high'

export interface ReportMetadata {
  project_name: string
  generated_at: string
  sources_analyzed: number
  insights_extracted: number
  themes_identified: number
  segments_detected: Segment[]
  /** Total character count across all source documents. Optional. */
  corpus_chars?: number
}

export interface KeyFinding {
  rank: number
  finding: string
  evidence: string
  affected_segments: Segment[]
  severity: Severity
  sources?: string[]
}

export interface SegmentProfile {
  top_concern: string
  summary: string
  key_quote: string
}

export interface SegmentBreakdown {
  smb: SegmentProfile
  enterprise: SegmentProfile
  freelancer: SegmentProfile
  general?: SegmentProfile
}

export interface Theme {
  name: string
  description: string
  severity: Severity
  affected_segments: Segment[]
  insight_count: number
  key_quotes: { quote: string; segment: Segment; source: string }[]
  interpretation: string
}

export interface PriorityMatrixItem {
  theme_name: string
  importance: number
  urgency: number
  insight_count: number
  severity: Severity
}

export interface Recommendation {
  rank: number
  action: string
  rationale: string
  target_segment: Segment | 'all'
  expected_impact: string
  effort_estimate: Effort
}

export interface NotableQuote {
  quote: string
  speaker: string
  segment: Segment
  context: string
}

export interface Report {
  report_metadata: ReportMetadata
  executive_summary: string
  key_findings: KeyFinding[]
  segment_breakdown: SegmentBreakdown
  themes: Theme[]
  priority_matrix_data: PriorityMatrixItem[]
  recommendations: Recommendation[]
  notable_quotes: NotableQuote[]
}