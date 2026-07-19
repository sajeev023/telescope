import { z } from 'zod'

const segmentSchema = z.enum(['smb', 'enterprise', 'freelancer', 'general'])

const severitySchema = z.enum(['critical', 'high', 'medium', 'low', 'positive'])

const effortSchema = z.enum(['low', 'medium', 'high'])

const reportMetadataSchema = z.object({
  project_name: z.string(),
  generated_at: z.string(),
  sources_analyzed: z.number().int().min(0),
  insights_extracted: z.number().int().min(0),
  themes_identified: z.number().int().min(0),
  segments_detected: z.array(segmentSchema),
  corpus_chars: z.number().int().min(0).optional(),
})

const keyFindingSchema = z.object({
  rank: z.number().int().min(1),
  finding: z.string(),
  evidence: z.string(),
  affected_segments: z.array(segmentSchema),
  severity: severitySchema,
  sources: z.array(z.string()).optional(),
})

const segmentProfileSchema = z.object({
  top_concern: z.string(),
  summary: z.string(),
  key_quote: z.string(),
})

const segmentBreakdownSchema = z.object({
  smb: segmentProfileSchema,
  enterprise: segmentProfileSchema,
  freelancer: segmentProfileSchema,
  general: segmentProfileSchema.optional(),
})

const keyQuoteSchema = z.object({
  quote: z.string(),
  segment: segmentSchema,
  source: z.string(),
})

const themeSchema = z.object({
  name: z.string(),
  description: z.string(),
  severity: severitySchema,
  affected_segments: z.array(segmentSchema),
  insight_count: z.number().int().min(0),
  key_quotes: z.array(keyQuoteSchema),
  interpretation: z.string(),
})

const priorityMatrixItemSchema = z.object({
  theme_name: z.string(),
  importance: z.number().min(0).max(10),
  urgency: z.number().min(0).max(10),
  insight_count: z.number().int().min(0),
  severity: severitySchema,
})

const recommendationSchema = z.object({
  rank: z.number().int().min(1),
  action: z.string(),
  rationale: z.string(),
  target_segment: z.union([segmentSchema, z.literal('all')]),
  expected_impact: z.string(),
  effort_estimate: effortSchema,
})

const notableQuoteSchema = z.object({
  quote: z.string(),
  speaker: z.string(),
  segment: segmentSchema,
  context: z.string(),
})

export const reportSchema = z.object({
  report_metadata: reportMetadataSchema,
  executive_summary: z.string(),
  key_findings: z.array(keyFindingSchema),
  segment_breakdown: segmentBreakdownSchema,
  themes: z.array(themeSchema),
  priority_matrix_data: z.array(priorityMatrixItemSchema),
  recommendations: z.array(recommendationSchema),
  notable_quotes: z.array(notableQuoteSchema),
})

export type ValidatedReport = z.infer<typeof reportSchema>

/**
 * Validate and sanitize a parsed report object. Returns a tuple:
 * [validatedReport, null] on success, or [null, errorMessage] on failure.
 * On success, the returned report is guaranteed to match the Report type.
 */
export function validateReport(raw: unknown): {
  report: ValidatedReport | null
  error: string | null
} {
  const result = reportSchema.safeParse(raw)
  if (result.success) {
    return { report: result.data, error: null }
  }
  const issues = result.error.issues
    .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
    .join('\n')
  return { report: null, error: `Report validation failed:\n${issues}` }
}
