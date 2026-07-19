import { NextRequest } from 'next/server'
import { generateStream } from '@/lib/providers'
import { env } from '@/lib/env'
import {
  MODEL_CONFIG,
  buildExtractionPrompt,
  buildClusteringPrompt,
  buildReportGenerationPrompt,
  parseJsonResponse,
  ClusteredTheme,
} from '@/lib/prompts'
import { extractCompleteInsights, extractSegmentsDetected, PartialInsight } from '@/lib/stream-json'
import { validateReport } from '@/lib/validation'
import type { Report } from '@/types/report'

export const maxDuration = 90
const STREAM_DEADLINE_MS = 85_000 // 5s buffer below Vercel's 90s limit
export const dynamic = 'force-dynamic'

type IncomingDoc = { name?: string; content?: string }

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
}

function normalizeDocs(raw: unknown): { documents: Array<{ name: string; content: string }>; totalChars: number } {
  if (!Array.isArray(raw)) {
    throw new Error('documents or files array is required and must be an array')
  }
  if (raw.length === 0) {
    throw new Error('at least one document is required')
  }
  if (raw.length > env.MAX_FILES) {
    throw new Error(`too many files — max ${env.MAX_FILES}, got ${raw.length}`)
  }
  const documents: Array<{ name: string; content: string }> = []
  let totalChars = 0
  for (const d of raw as IncomingDoc[]) {
    if (!d || typeof d !== 'object') {
      throw new Error('each file must be an object with name and content')
    }
    const name = typeof d.name === 'string' && d.name.length > 0 ? d.name.slice(0, 200) : 'Untitled'
    const content = typeof d.content === 'string' ? d.content : ''
    totalChars += content.length
    documents.push({ name, content })
  }
  if (totalChars > env.MAX_TOTAL_CONTENT_CHARS) {
    throw new Error(
      `combined content too large — max ${env.MAX_TOTAL_CONTENT_CHARS.toLocaleString()} chars (~200K tokens), got ${totalChars.toLocaleString()}`,
    )
  }
  return { documents, totalChars }
}

export async function POST(req: NextRequest) {
  console.log('[POST /api/analyze] Incoming request received.')
  let body: unknown
  try {
    body = await req.json()
    console.log('[POST /api/analyze] Request body parsed successfully.')
  } catch (err: any) {
    console.error('[POST /api/analyze] Request body is not valid JSON:', err.message)
    return badRequest('request body must be valid JSON')
  }

  const filesRaw = (body as { documents?: unknown; files?: unknown }).documents || (body as { files?: unknown }).files
  console.log('[POST /api/analyze] Raw files key exists:', !!filesRaw)

  let documents: Array<{ name: string; content: string }>
  let totalChars: number
  try {
    const normalized = normalizeDocs(filesRaw)
    documents = normalized.documents
    totalChars = normalized.totalChars
    console.log(`[POST /api/analyze] Normalized documents: count=${documents.length}, totalChars=${totalChars}`)
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : 'invalid documents'
    console.error(`[POST /api/analyze] Document normalization failed: ${errMsg}`)
    return badRequest(errMsg)
  }

  const totalFiles = documents.length
  // Four real phases: reading (per file), extracting, clustering, generating.
  const totalSteps = totalFiles + 3

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false
      const emittedInsightTexts = new Set<string>()

      const sendJSON = (obj: Record<string, unknown>) => {
        if (isClosed) return
        const payloadStr = JSON.stringify(obj)
        console.log(`[POST /api/analyze] Sending SSE payload: ${payloadStr.slice(0, 150)}${payloadStr.length > 150 ? '...' : ''}`)
        controller.enqueue(encoder.encode(`data: ${payloadStr}\n\n`))
      }
      const sendDone = () => {
        if (isClosed) return
        console.log(`[POST /api/analyze] Sending SSE DONE sentinel.`)
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      }
      const sendError = (errorMsg: string) => {
        console.error(`[POST /api/analyze] Sending SSE ERROR: ${errorMsg}`)
        sendJSON({ error: errorMsg })
      }
      const close = () => {
        if (isClosed) return
        isClosed = true
        console.log(`[POST /api/analyze] Closing SSE stream controller.`)
        try { controller.close() } catch { /* ignore */ }
      }

      try {
        // PHASE 1: Reading. We do a quick per-file pass to confirm there's
        // extractable content and emit progress so the UI can show each
        // source being ingested. This is real per-file work — we're
        // checking each document is non-empty and counting tokens.
        for (let i = 0; i < totalFiles; i++) {
          const content = documents[i].content || ''
          const charCount = content.length
          const wordCount = content.trim().split(/\s+/).filter(Boolean).length
          sendJSON({
            step: i,
            progress: Math.round(((i + 1) / totalSteps) * 100),
            reading: {
              file: documents[i].name,
              chars: charCount,
              words: wordCount,
              empty: charCount === 0 || content.trim().length === 0,
            },
          })
          // Minimal delay so the UI can paint each file.
          await new Promise((r) => setTimeout(r, 10))
        }

        // PHASE 2: Extraction. Stream tokens from the model and parse
        // the JSON incrementally — emit each insight as soon as the
        // model finishes writing it.
        const extractionStepIndex = totalFiles
        sendJSON({ step: extractionStepIndex, progress: Math.round(((extractionStepIndex + 1) / totalSteps) * 100) })

        let extractedInsights: PartialInsight[] = []
        let extractionFailed = false
        let extractionErrorMsg = ''
        let detectedSegments: string[] = ['general']

        if (documents.some((d) => d.content.trim().length > 0)) {
          try {
            const promptText = buildExtractionPrompt({
              documents,
              segments: ['smb', 'enterprise', 'freelancer'],
            })
            let accumulatedResponse = ''
            let lastEmittedCount = 0

            console.log('[POST /api/analyze] Starting Phase 2: AI Insight Extraction.')
            await generateStream(
              {
                messages: [
                  { role: 'system', content: MODEL_CONFIG.systemPrompt },
                  { role: 'user', content: promptText },
                ],
                temperature: MODEL_CONFIG.temperature,
                topP: MODEL_CONFIG.top_p,
                maxTokens: MODEL_CONFIG.maxTokens,
              },
              (chunk) => {
                accumulatedResponse += chunk
                const seen = extractCompleteInsights(accumulatedResponse)
                if (seen.length > lastEmittedCount) {
                  for (let k = lastEmittedCount; k < seen.length; k++) {
                    const ins = seen[k]
                    if (!emittedInsightTexts.has(ins.text)) {
                      emittedInsightTexts.add(ins.text)
                      sendJSON({
                        insight: {
                          text: ins.text,
                          segment: (ins.segment || 'general').toLowerCase(),
                          source: ins.source,
                          confidence: ins.confidence,
                        },
                      })
                    }
                  }
                  lastEmittedCount = seen.length
                }
              },
              STREAM_DEADLINE_MS,
            )

            extractedInsights = extractCompleteInsights(accumulatedResponse)
            console.log(`[POST /api/analyze] Insight extraction complete. Extracted count: ${extractedInsights.length}`)
            const segs = extractSegmentsDetected(accumulatedResponse)
            if (segs && segs.length > 0) detectedSegments = segs
          } catch (extractErr: any) {
            console.error('[API Analyze] Extraction failed with error:', extractErr)
            extractionFailed = true
            extractionErrorMsg = extractErr instanceof Error ? extractErr.message : String(extractErr)
          }
        }

        if (extractionFailed) {
          const actionMsg = `AI extraction failed: ${extractionErrorMsg || 'Unknown error'}. Please check your API key / model configuration and try again.`
          console.error(`[POST /api/analyze] Aborting pipeline. Error: ${actionMsg}`)
          sendError(actionMsg)
          sendDone()
          close()
          return
        }

        if (extractedInsights.length === 0) {
          console.warn('[POST /api/analyze] No insights could be extracted.')
          sendError('No insights could be extracted from the uploaded documents. Try uploading documents with more substantive text content.')
          sendDone()
          close()
          return
        }

        // PHASE 3: Clustering. A real LLM call that takes the extracted
        // insights and produces theme clusters. This is what the
        // "Clustering" pipeline step actually does — not a setTimeout.
        const clusterStep = totalFiles + 1
        sendJSON({ step: clusterStep, progress: Math.round(((clusterStep + 1) / totalSteps) * 100) })

        let clusteredThemes: ClusteredTheme[] = []
        try {
          const clusterPrompt = buildClusteringPrompt({
            insights: extractedInsights,
            segmentsDetected: detectedSegments,
          })
          let clusterRaw = ''
          console.log('[POST /api/analyze] Starting Phase 3: AI Clustering.')
          await generateStream(
            {
              messages: [
                { role: 'system', content: MODEL_CONFIG.systemPrompt },
                { role: 'user', content: clusterPrompt },
              ],
              temperature: MODEL_CONFIG.temperature,
              topP: MODEL_CONFIG.top_p,
              maxTokens: 4096,
            },
            (chunk) => { clusterRaw += chunk },
            STREAM_DEADLINE_MS,
          )
          const parsed = parseJsonResponse<{ themes: ClusteredTheme[] }>(clusterRaw)
          if (parsed && Array.isArray(parsed.themes)) {
            clusteredThemes = parsed.themes
            console.log(`[POST /api/analyze] Theme clustering complete. Clustered count: ${clusteredThemes.length}`)
          }
        } catch (clusterErr) {
          console.error('[API Analyze] Clustering failed (continuing without pre-clustering):', clusterErr)
          // Clustering is best-effort — if it fails, the report
          // generation call will derive themes itself.
        }

        // Derive detected segments from actual extracted insights.
        const actualSegments = [...new Set(extractedInsights.map((ins) => ins.segment).filter(Boolean))]
        const finalDetectedSegments = actualSegments.length > 0 ? actualSegments : detectedSegments

        // PHASE 4: Report generation. Takes insights + pre-clustered
        // themes and produces the final report JSON.
        const genStep = totalFiles + 2
        sendJSON({ step: genStep, progress: Math.round(((genStep + 1) / totalSteps) * 100) })

        let finalReport: Report | null = null
        let reportGenErrorMsg = ''
        try {
          const reportPromptText = buildReportGenerationPrompt({
            projectName: 'Research Synthesis',
            insights: extractedInsights.map((ins) => ({
              text: ins.text,
              segment: ins.segment,
              source: ins.source,
              confidence: ins.confidence,
            })),
            segmentsDetected: finalDetectedSegments,
            sourceCount: documents.length,
            documents: env.LLM_PROVIDER.toLowerCase() === 'groq' ? undefined : documents,
            themes: clusteredThemes.length > 0 ? clusteredThemes : undefined,
          })

          let accumulatedReportRaw = ''
          console.log('[POST /api/analyze] Starting Phase 4: AI Report Generation.')
          await generateStream(
            {
              messages: [
                { role: 'system', content: MODEL_CONFIG.systemPrompt },
                { role: 'user', content: reportPromptText },
              ],
              temperature: MODEL_CONFIG.temperature,
              topP: MODEL_CONFIG.top_p,
              maxTokens: MODEL_CONFIG.maxTokens,
            },
            (chunk) => { accumulatedReportRaw += chunk },
            STREAM_DEADLINE_MS,
          )

          const parsed = parseJsonResponse<Report>(accumulatedReportRaw)
          if (!parsed || typeof parsed !== 'object') {
            throw new Error('Report generation returned non-object')
          }

          // Attach totalChars before validation.
          if (parsed.report_metadata) {
            parsed.report_metadata.corpus_chars = totalChars
          }

          const { report: validated, error: validationError } = validateReport(parsed)
          if (!validated) {
            throw new Error(validationError || 'Report validation failed')
          }
          finalReport = validated as unknown as Report
          console.log('[POST /api/analyze] Report generation complete and validated successfully.')
        } catch (genErr: any) {
          console.error('[API Analyze] Report generation failed:', genErr)
          reportGenErrorMsg = genErr instanceof Error ? genErr.message : String(genErr)
        }

        if (!finalReport) {
          const actionMsg = `Report generation failed: ${reportGenErrorMsg || 'Unknown error'}. The AI was unable to produce a valid report. Please try again.`
          console.error(`[POST /api/analyze] Aborting pipeline. Error: ${actionMsg}`)
          sendError(actionMsg)
          sendDone()
          close()
          return
        }

        sendJSON({
          step: totalSteps,
          progress: 100,
          complete: true,
          status: 'complete',
          report: finalReport,
        })
        sendDone()
      } catch (error: unknown) {
        console.error('[API Analyze] Error in SSE stream:', error)
        const message = error instanceof Error ? error.message : 'An unexpected error occurred during generation'
        sendError(message)
        sendDone()
      } finally {
        close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      // Framing prevented by global SAMEORIGIN header.
    },
  })
}