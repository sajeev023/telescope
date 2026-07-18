import { env } from './env'

export interface GeminiChatOptions {
  model?: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  maxTokens?: number
}

export class GeminiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'GeminiError'
  }
}

export async function generateGeminiStream(
  options: GeminiChatOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  if (!env.GEMINI_API_KEY) {
    throw new GeminiError('Gemini API key is missing. Set GEMINI_API_KEY in your environment.')
  }

  const model = options.model || env.GEMINI_MODEL
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${env.GEMINI_API_KEY}`

  const systemMessage = options.messages.find((m) => m.role === 'system')
  const userMessages = options.messages.filter((m) => m.role !== 'system')

  const contents = userMessages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.1,
      maxOutputTokens: options.maxTokens ?? 8192,
      topP: 0.9,
    },
  }

  if (systemMessage) {
    body.systemInstruction = {
      parts: [{ text: systemMessage.content }],
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), env.GEMINI_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      let errorMessage = `Gemini request failed: HTTP ${response.status}`
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.error?.message) {
          errorMessage = `Gemini request failed: ${errorJson.error.message}`
        }
      } catch {
        errorMessage = `Gemini request failed: ${errorText}`
      }
      throw new GeminiError(errorMessage, response.status)
    }

    if (!response.body) {
      throw new GeminiError('Gemini response body is empty')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith(':')) continue

        let dataLine = trimmed
        if (dataLine.startsWith('data:')) {
          dataLine = dataLine.slice(5).trim()
        }
        if (dataLine === '[DONE]') break

        try {
          const parsed = JSON.parse(dataLine)
          const parts = parsed.candidates?.[0]?.content?.parts
          if (parts && Array.isArray(parts)) {
            for (const part of parts) {
              if (part.text) {
                onChunk(part.text)
              }
            }
          }
        } catch {
          // ignore non-JSON lines
        }
      }
    }
  } catch (err) {
    clearTimeout(timeout)
    if (err instanceof GeminiError) {
      throw err
    }
    const error = err as Error
    if (error.name === 'AbortError') {
      throw new GeminiError(`Gemini request timed out after ${env.GEMINI_TIMEOUT_MS}ms`)
    }
    throw new GeminiError(`Gemini request failed: ${error.message}`)
  }
}
