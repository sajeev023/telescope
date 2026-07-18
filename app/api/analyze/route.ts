import { NextRequest } from 'next/server'
import { generateOllamaStream } from '@/lib/ollama'
import {
  MODEL_CONFIG,
  buildExtractionPrompt,
  buildReportGenerationPrompt,
  parseJsonResponse,
  ExtractionResult,
} from '@/lib/prompts'
import type { Report } from '@/types/report'

export const maxDuration = 90
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const rawDocs = body.documents || body.files || []

    if (!Array.isArray(rawDocs) || rawDocs.length === 0) {
      return new Response(JSON.stringify({ error: 'documents or files array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const documents = rawDocs.map((d: { name?: string; content?: string }) => ({
      name: d.name || 'Untitled',
      content: d.content || '',
    }))

    const totalFiles = documents.length
    const totalSteps = totalFiles + 5 // N reading steps + extract + cluster + prioritize + verify + generate

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let isClosed = false

        const sendJSON = (obj: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
        }

        const sendDone = () => {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        }

        const sendError = (errorMsg: string) => {
          sendJSON({ error: errorMsg })
        }

        try {
          // Reading steps — one per actual file
          for (let i = 0; i < totalFiles; i++) {
            const progressPct = Math.round(((i + 1) / totalSteps) * 100)
            sendJSON({
              step: i,
              progress: progressPct,
            })
            await new Promise((r) => setTimeout(r, 200))
          }

          // Extraction step
          const extractionStepIndex = totalFiles
          sendJSON({ step: extractionStepIndex, progress: Math.round(((extractionStepIndex + 1) / totalSteps) * 100) })

          let extractedInsights: Array<{ text: string; segment: string; source: string; confidence: number }> = []
          let extractionFailed = false

          if (documents.some((d) => d.content.trim().length > 0)) {
            try {
              const promptText = buildExtractionPrompt({
                documents,
                segments: ['smb', 'enterprise', 'freelancer'],
              })

              const messages = [
                { role: 'system' as const, content: MODEL_CONFIG.systemPrompt },
                { role: 'user' as const, content: promptText },
              ]

              let accumulatedResponse = ''
              await generateOllamaStream(
                {
                  messages,
                  temperature: MODEL_CONFIG.temperature,
                  maxTokens: MODEL_CONFIG.maxTokens,
                },
                (chunk) => {
                  accumulatedResponse += chunk
                }
              )

              const parsedExtraction = parseJsonResponse<ExtractionResult>(accumulatedResponse)
              if (parsedExtraction && Array.isArray(parsedExtraction.insights)) {
                extractedInsights = parsedExtraction.insights
              }
            } catch (ollamaErr) {
              console.error('[API Analyze] Extraction failed:', ollamaErr)
              extractionFailed = true
            }
          }

          // Emit insights from extraction
          if (extractedInsights.length > 0) {
            for (const ins of extractedInsights) {
              sendJSON({
                insight: {
                  text: ins.text,
                  segment: (ins.segment.toLowerCase()) || 'smb',
                },
              })
              await new Promise((r) => setTimeout(r, 100))
            }
          } else if (extractionFailed) {
            sendError('AI extraction failed. Please check your Ollama API key and try again.')
            sendDone()
            controller.close()
            return
          }

          // Clustering, prioritizing, verifying steps
          const clusterStep = totalFiles + 1
          const prioStep = totalFiles + 2
          const verifyStep = totalFiles + 3

          sendJSON({ step: clusterStep, progress: Math.round(((clusterStep + 1) / totalSteps) * 100) })
          await new Promise((r) => setTimeout(r, 300))

          sendJSON({ step: prioStep, progress: Math.round(((prioStep + 1) / totalSteps) * 100) })
          await new Promise((r) => setTimeout(r, 300))

          sendJSON({ step: verifyStep, progress: Math.round(((verifyStep + 1) / totalSteps) * 100) })
          await new Promise((r) => setTimeout(r, 300))

          // Report generation step
          const genStep = totalFiles + 4
          sendJSON({ step: genStep, progress: Math.round(((genStep + 1) / totalSteps) * 100) })

          // Derive detected segments from actual extracted insights
          const actualSegments = [...new Set(extractedInsights.map((ins) => ins.segment).filter(Boolean))]
          const detectedSegments = actualSegments.length > 0 ? actualSegments : ['general']

          let finalReport: Report | null = null

          if (extractedInsights.length > 0) {
            try {
              const reportPromptText = buildReportGenerationPrompt({
                projectName: 'Research Synthesis',
                insights: extractedInsights,
                segmentsDetected: detectedSegments,
                sourceCount: documents.length,
                documents,
              })

              const messages = [
                { role: 'system' as const, content: MODEL_CONFIG.systemPrompt },
                { role: 'user' as const, content: reportPromptText },
              ]

              let accumulatedReportRaw = ''
              await generateOllamaStream(
                {
                  messages,
                  temperature: MODEL_CONFIG.temperature,
                  maxTokens: MODEL_CONFIG.maxTokens,
                },
                (chunk) => {
                  accumulatedReportRaw += chunk
                }
              )

              console.log('[API Analyze] Raw report response (first 1000 chars):',
                accumulatedReportRaw.slice(0, 1000))
              console.log('[API Analyze] Raw report response (last 500 chars):',
                accumulatedReportRaw.slice(-500))

              try {
                finalReport = parseJsonResponse<Report>(accumulatedReportRaw)
              } catch (parseErr) {
                console.error('[API Analyze] Report JSON parse error:', parseErr)
                console.error('[API Analyze] Full raw response:', accumulatedReportRaw)
                throw parseErr
              }

              // Normalize: ensure all required fields exist
              if (!finalReport.report_metadata) {
                throw new Error('Report missing report_metadata')
              }
              finalReport.key_findings = finalReport.key_findings || []
              finalReport.themes = finalReport.themes || []
              finalReport.priority_matrix_data = finalReport.priority_matrix_data || []
              finalReport.recommendations = finalReport.recommendations || []
              finalReport.notable_quotes = finalReport.notable_quotes || []
              finalReport.executive_summary = finalReport.executive_summary || ''
              if (!finalReport.segment_breakdown) {
                finalReport.segment_breakdown = {
                  smb: { top_concern: 'Insufficient evidence in the uploaded documents.', summary: 'Insufficient evidence in the uploaded documents.', key_quote: 'Insufficient evidence in the uploaded documents.' },
                  enterprise: { top_concern: 'Insufficient evidence in the uploaded documents.', summary: 'Insufficient evidence in the uploaded documents.', key_quote: 'Insufficient evidence in the uploaded documents.' },
                  freelancer: { top_concern: 'Insufficient evidence in the uploaded documents.', summary: 'Insufficient evidence in the uploaded documents.', key_quote: 'Insufficient evidence in the uploaded documents.' },
                }
              }
            } catch (genErr) {
              console.error('[API Analyze] Report generation failed:', genErr)
            }
          }

          if (!finalReport) {
            sendError('Report generation failed. The AI was unable to produce a valid report. Please try again.')
            sendDone()
            controller.close()
            return
          }

          // Emit complete event
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
          if (!isClosed) {
            isClosed = true
            try {
              controller.close()
            } catch {
              // Ignore if already closed
            }
          }
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error: unknown) {
    console.error('[API Analyze] Unhandled error:', error)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
