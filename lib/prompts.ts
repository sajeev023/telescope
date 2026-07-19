export interface ModelConfig {
  temperature: number
  top_p: number
  maxTokens: number
  systemPrompt: string
}

export const MODEL_CONFIG: ModelConfig = {
  temperature: 0.1,
  top_p: 0.9,
  maxTokens: 8192,
  systemPrompt: `You are a research synthesis engine. Your purpose is to produce faithful, evidence-based analyses of uploaded documents.

CRITICAL RULES — VIOLATION IS HALLUCINATION:

1. NEVER invent facts, data, quotes, names, statistics, percentages, revenue figures, timelines, deadlines, KPIs, business metrics, customer segments, company names, feature names, risks, opportunities, priorities, or recommendations that are not explicitly stated in the uploaded documents.

2. If a requested report section cannot be fully populated from the provided evidence, write exactly: "Insufficient evidence in the uploaded documents." Do NOT guess, extrapolate, or fabricate.

3. Report scale must match evidence volume. A single short document produces a small report. A large research dataset produces a comprehensive report. Never pad a small input with fabricated analysis.

4. Every claim must cite specific evidence from the documents. If evidence is weak, say so. If evidence is absent, say so.

5. Confidence scores must reflect actual evidence strength: high confidence (0.9-1.0) = multiple direct mentions; medium (0.7-0.8) = a single clear mention; low (0.5-0.6) = a weak or indirect mention.

6. Quotes must be exact text from the documents. Do not paraphrase and present as a quote.

7. Recommendations may only exist if the documents contain explicit support for them.

8. Act as an unbiased research analyst, not a consultant. Do not add strategic advice, business commentary, or industry knowledge that is not present in the source material.

9. Output only valid JSON. No prose, no markdown, no commentary outside the JSON structure.`,
}

export interface ExtractionInput {
  documents: Array<{ name: string; content: string }>
  segments: string[]
}

export interface ExtractedInsight {
  text: string
  segment: string
  source: string
  confidence: number
}

export interface ExtractionResult {
  insights: ExtractedInsight[]
  segmentsDetected: string[]
}

export function buildExtractionPrompt(input: ExtractionInput): string {
  const { documents, segments } = input
  const combinedDocs = documents
    .map((d) => `=== DOCUMENT: ${d.name} ===\n${d.content}`)
    .join('\n\n')

  const segmentList = segments.join(', ')

  return `Extract insights from the uploaded documents. Each insight must be a single, specific statement that is directly supported by the document text.

DOCUMENTS:
${combinedDocs}

REFERENCE SEGMENTS: ${segmentList}

TASK:
Read every document carefully. For each document, extract every distinct, meaningful statement that the document explicitly makes. Do not add interpretation, analysis, or inferred meaning beyond what the text literally states.

For each insight, provide:
- text: The insight statement — a neutral observation of what the document says, written in your own words but strictly limited to what the text states
- segment: ONLY if the document explicitly identifies a user type or category. If no segment is mentioned or implied, use "general"
- source: The exact document name this insight comes from
- confidence: 1.0 = directly and unambiguously stated in those words; 0.8-0.9 = clearly stated but rephrased; 0.6-0.7 = reasonably inferred from strong context; do not include any insight below 0.6

RULES:
- Extract insights proportionally to document length. A single short paragraph → 1-3 insights maximum. A multi-page document → proportionally more.
- Do NOT create insights about business metrics, customer segments, competitors, pricing, revenue, deadlines, or feature requests unless the document explicitly discusses them.
- Do NOT merge multiple distinct statements into one insight — split them.
- Every insight must be traceable to a specific sentence or passage in a specific document.
- If a document contains no extractable insights (empty, gibberish, or purely metadata), do not include it.
- If no insights can be extracted from any document, return an empty insights array.

OUTPUT FORMAT (JSON only):
{
  "insights": [
    {
      "text": "The document states that...",
      "segment": "general",
      "source": "document-name.txt",
      "confidence": 0.9
    }
  ],
  "segmentsDetected": ["general"]
}

segmentsDetected must only include segments explicitly named in the documents. If no segment information exists, use ["general"].`
}

export interface ReportGenerationInput {
  projectName: string
  insights: ExtractedInsight[]
  segmentsDetected: string[]
  sourceCount: number
  documents?: Array<{ name: string; content: string }>
  themes?: ClusteredTheme[]
}

/**
 * A theme produced by the clustering call. The report-generation call
 * receives these as input and turns them into the final Theme objects
 * in the report, so the "Clustering" pipeline step is real work, not
 * a setTimeout placeholder.
 */
export interface ClusteredTheme {
  name: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'positive'
  affected_segments: string[]
  insight_indices: number[]
  key_quote_texts: string[]
}

export interface ClusteringInput {
  insights: ExtractedInsight[]
  segmentsDetected: string[]
}

export function buildClusteringPrompt(input: ClusteringInput): string {
  const { insights, segmentsDetected } = input
  const insightsJson = JSON.stringify(
    insights.map((ins, i) => ({
      index: i,
      text: ins.text,
      segment: ins.segment,
      source: ins.source,
      confidence: ins.confidence,
    })),
    null,
    2,
  )

  return `Cluster the extracted insights into themes. A theme must be derived from MULTIPLE (2+) supporting insights. If fewer than two insights can be grouped together, return an empty themes array.

EXTRACTED INSIGHTS:
${insightsJson}

SEGMENTS DETECTED: ${segmentsDetected.join(', ') || 'general'}

TASK:
1. Group insights that share a concrete underlying concern, pain, or strength. Do not group by segment alone — segment is a facet, not a theme.
2. For each cluster, derive a short, specific theme name (3-6 words). "Onboarding friction" is good. "Issues" is bad.
3. Write a one-sentence description of what the cluster is about, grounded in the insight texts.
4. Assign a severity derived from the evidence:
   - critical = repeated, specific, high-stakes complaints (production outages, churn risk, lost revenue)
   - high = repeated complaints with clear business impact
   - medium = real friction with moderate impact
   - low = mentioned but not blocking
   - positive = strengths, retention drivers, moats (only cluster positive insights together if 2+ clearly share a strength theme)
5. affected_segments: only segments that appear in the cluster's insights, drawn from SEGMENTS DETECTED.
6. insight_indices: the exact index numbers from the EXTRACTED INSIGHTS array that belong to this cluster. Every insight should belong to exactly one cluster, but small/rare insights that don't fit any cluster can be left out.
7. key_quote_texts: 1-3 short verbatim phrases drawn directly from the insight texts that best represent the cluster. These must be exact substrings of insight.text values.

RULES:
- Output only valid JSON. No prose, no markdown.
- If there are fewer than 2 insights total, return {"themes": []}.
- Do not invent insights that aren't in the input. Do not invent quotes that aren't substrings of insight texts.
- 2-6 themes is the right number for a 10-30 insight corpus. Fewer for smaller corpora. More for larger. Scale to evidence.

OUTPUT FORMAT:
{
  "themes": [
    {
      "name": string,
      "description": string,
      "severity": "critical"|"high"|"medium"|"low"|"positive",
      "affected_segments": string[],
      "insight_indices": number[],
      "key_quote_texts": string[]
    }
  ]
}`
}

export function buildReportGenerationPrompt(input: ReportGenerationInput): string {
  const { projectName, insights, segmentsDetected, sourceCount, documents, themes } = input
  const insightsJson = JSON.stringify(insights, null, 2)
  const today = new Date().toISOString().split('T')[0]

  const documentsText = documents && documents.length > 0
    ? `\nORIGINAL DOCUMENTS:\n${documents.map((d) => `=== ${d.name} ===\n${d.content}`).join('\n\n')}`
    : ''

  const themesText = themes && themes.length > 0
    ? `\nPRE-CLUSTERED THEMES (produced by a separate clustering step — use these, do not re-cluster):\n${JSON.stringify(themes, null, 2)}\n\nThe themes above are authoritative. Build the report's themes[] array from them. For each theme, find the supporting insights by matching insight_indices against the EXTRACTED INSIGHTS array. ${documentsText ? 'Pull key_quotes verbatim from the ORIGINAL DOCUMENTS using the key_quote_texts as search anchors.' : 'Use the key_quote_texts from the pre-clustered themes or insight texts as the key_quotes.'}`
    : '\nNo pre-clustered themes were provided. Derive themes from the insights using the standard 2+ supporting insights rule.'

  const schema = `{
  "report_metadata": {
    "project_name": string,
    "generated_at": string,
    "sources_analyzed": number,
    "insights_extracted": number,
    "themes_identified": number,
    "segments_detected": string[]
  },
  "executive_summary": string,
  "key_findings": [
    { "rank": number, "finding": string, "evidence": string, "affected_segments": string[], "severity": "critical"|"high"|"medium"|"low", "sources": string[] }
  ],
  "segment_breakdown": {
    "smb": { "top_concern": string, "summary": string, "key_quote": string },
    "enterprise": { "top_concern": string, "summary": string, "key_quote": string },
    "freelancer": { "top_concern": string, "summary": string, "key_quote": string }
  },
  "themes": [
    { "name": string, "description": string, "severity": "critical"|"high"|"medium"|"low", "affected_segments": string[], "insight_count": number, "key_quotes": [{ "quote": string, "segment": string, "source": string }], "interpretation": string }
  ],
  "priority_matrix_data": [
    { "theme_name": string, "importance": number, "urgency": number, "insight_count": number, "severity": "critical"|"high"|"medium"|"low" }
  ],
  "recommendations": [
    { "rank": number, "action": string, "rationale": string, "target_segment": string, "expected_impact": string, "effort_estimate": "low"|"medium"|"high" }
  ],
  "notable_quotes": [
    { "quote": string, "speaker": string, "segment": string, "context": string }
  ]
}`

  return `Generate a research report from extracted insights. The report must be ENTIRELY faithful to the evidence provided.

PROJECT: ${projectName}
DATE: ${today}
SOURCES ANALYZED: ${sourceCount}
INSIGHTS PROVIDED: ${insights.length}
SEGMENTS DETECTED: ${segmentsDetected.join(', ')}

EXTRACTED INSIGHTS:
${insightsJson}${documentsText}${themesText}

REPORT GENERATION RULES — READ AND FOLLOW EVERY RULE:

=== RULE 1: EVIDENCE REQUIREMENT ===
Every single statement in every section MUST be directly supported by the extracted insights or original documents. If you cannot find supporting evidence, do not make the statement. It is better to say "Insufficient evidence" than to fabricate.

=== RULE 2: INSUFFICIENT EVIDENCE ===
For any field that cannot be populated from the provided data, write exactly: "Insufficient evidence in the uploaded documents." Do NOT fill gaps with assumptions, general knowledge, or plausible-sounding text.

=== RULE 3: SCALE TO EVIDENCE ===
The report size must match the available evidence:
- 0-5 insights → small report (1 finding maximum, 0-1 themes, 0-1 recommendations)
- 5-20 insights → medium report
- 20+ insights → comprehensive report
Do NOT generate more findings, themes, or recommendations than the evidence supports.

=== RULE 4: FORBIDDEN FABRICATIONS ===
NEVER generate any of the following unless explicitly stated in the source documents:
- Percentages or statistics
- Revenue figures, pricing, ARR, or any financial metrics
- Customer segments — only use segments from SEGMENTS DETECTED
- Timelines, deadlines, or time-based urgency
- KPIs, activation rates, churn rates, or any metrics
- Priorities or rankings not supported by evidence
- Recommendations not supported by evidence
- Quotes that are not verbatim from source
- Names, company names, or titles not in source
- Feature names or product names not in source
- Risks, opportunities, or competitive analysis not in source

=== RULE 5: SECTION-BY-SECTION INSTRUCTIONS ===

report_metadata:
- project_name: "${projectName}"
- generated_at: "${today}"
- sources_analyzed: ${sourceCount}
- insights_extracted: ${insights.length}
- themes_identified: The ACTUAL number of themes you generate (can be 0)
- segments_detected: ${JSON.stringify(segmentsDetected)}

executive_summary:
Summarize ONLY what the documents actually say. 1-3 paragraphs maximum. Do not add strategic recommendations, revenue impacts, or priorities unless the documents explicitly discuss them. A single sentence is correct for small inputs.

key_findings:
- Each finding MUST cite specific evidence from the insights or documents
- Rank findings by strength of evidence only, not by fabricated importance
- If there is only enough evidence for one finding, produce one finding
- The evidence field must contain the actual supporting statements
- sources: list the document names that support this finding (e.g., ["interview-smb-1.txt", "interview-enterprise-2.txt"])
- affected_segments must reference segments from SEGMENTS DETECTED only
- severity: derive from evidence (repeated strong complaints = "high", single mention = "low")
- If no findings can be made, return an empty array

segment_breakdown:
- Only populate segments that are listed in segmentsDetected
- For segments NOT detected, set ALL three fields to: "Insufficient evidence in the uploaded documents."
- For detected segments:
  - top_concern: The most mentioned concern in the evidence for this segment
  - summary: What the documents actually say about this segment
  - key_quote: A verbatim quote from the source documents
- If segmentsDetected is ["general"], set all three segment objects to "Insufficient evidence in the uploaded documents."

themes:
- A theme must be derived from MULTIPLE (2+) supporting insights or document statements
- If you cannot find multiple supporting statements, do not create the theme
- insight_count must equal the actual count of insights supporting this theme
- key_quotes must contain exact verbatim quotes from the source
- interpretation: a brief restatement of what the evidence shows, not strategic advice
- If zero themes exist, return an empty array

priority_matrix_data:
- One entry per theme that you generated
- importance: derived from evidence strength (frequency of mentions, specificity of language)
- urgency: derived from evidence only (e.g., user expresses frustration strongly = higher)
- severity: mirrors the theme's severity
- If zero themes exist, return an empty array

recommendations:
- Only generate if the documents explicitly suggest or support a specific action
- Each recommendation must reference specific evidence
- target_segment must match a segment from segmentsDetected or "all"
- effort_estimate: must be derived from the document text if mentioned, otherwise use "medium"
- expected_impact: describe what the evidence suggests would happen, do NOT invent numerical impacts
- If no recommendations are supported, return an empty array

notable_quotes:
- Only include verbatim quotes from the source documents
- speaker and context must come from the source
- Do not alter, summarize, or improve the quotes
- If no notable quotes exist, return an empty array

=== RULE 6: SMALL INPUT HANDLING ===
If the total number of insights is very small (1-3), the report must be correspondingly small. A single-sentence executive summary, one finding, and zero themes/recommendations is the CORRECT behavior. Do not pad.

OUTPUT FORMAT — Follow this JSON schema EXACTLY:
${schema}

Output ONLY the JSON object. No prose, no markdown, no comments.`
}

export function cleanJsonResponse(raw: string): string {
  let cleaned = raw.trim()

  // Extract from markdown code fence if present
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim()
  }

  // Find the outermost JSON object
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1)
  }

  return cleaned
}

export function parseJsonResponse<T>(raw: string): T {
  const cleaned = cleanJsonResponse(raw)

  // Attempt 1: direct parse
  try {
    return JSON.parse(cleaned) as T
  } catch {
    // Attempt 2: fix common LLM JSON errors
    let repaired = cleaned
      // Remove control characters (except whitespace)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
      // Fix trailing commas before closing braces/brackets
      .replace(/,(\s*[}\]])/g, '$1')

    try {
      return JSON.parse(repaired) as T
    } catch (error) {
      const syntaxError = error as SyntaxError
      const message = `JSON parse failed: ${syntaxError.message}. Cleaned input (first 500 chars): ${cleaned.slice(0, 500)}`
      throw new Error(message)
    }
  }
}

// Note: createExtractionMessages / createReportGenerationMessages /
// buildPrompt helpers were removed — the API routes assemble messages
// inline, which keeps the call sites next to the prompts they use.
