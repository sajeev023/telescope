import { env } from './env'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamOptions {
  model?: string
  messages: ChatMessage[]
  temperature?: number
  topP?: number
  maxTokens?: number
}

export class ProviderError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ProviderError'
  }
}

type ProviderName = 'gemini' | 'groq' | 'openai' | 'ollama'

type ProviderConfig = {
  apiKey: string
  model: string
  baseUrl: string
  /** Endpoint URL where the request is sent. */
  endpoint: string
  /** Request body, already provider-shaped. */
  body: Record<string, unknown>
  /** Headers to send. */
  headers: Record<string, string>
  /** Per-provider timeout (ms). */
  timeoutMs: number
  /** Extract streaming text chunks from a parsed SSE data line. */
  extractChunk: (parsed: unknown) => string | undefined
}

function buildProviderConfig(provider: ProviderName, options: StreamOptions): ProviderConfig {
  const topP = options.topP ?? 0.9
  const temperature = options.temperature ?? 0.1
  const maxTokens = options.maxTokens ?? 8192

  if (provider === 'gemini') {
    const apiKey = env.GEMINI_API_KEY
    if (!apiKey) {
      throw new ProviderError('Gemini API key is missing. Set GEMINI_API_KEY in your environment.')
    }
    const model = options.model || env.GEMINI_MODEL
    const baseUrl = 'https://generativelanguage.googleapis.com'
    const endpoint = `${baseUrl}/v1beta/models/${model}:streamGenerateContent?alt=sse`

    const systemMessage = options.messages.find((m) => m.role === 'system')
    const userMessages = options.messages.filter((m) => m.role !== 'system')
    const contents = userMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))
    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP,
      },
    }
    if (systemMessage) {
      body.systemInstruction = { parts: [{ text: systemMessage.content }] }
    }

    // Use the `x-goog-api-key` header instead of `?key=` query param so
    // the key doesn't leak into CDN/proxy/server logs.
    return {
      apiKey,
      model,
      baseUrl,
      endpoint,
      body,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      timeoutMs: env.GEMINI_TIMEOUT_MS,
      extractChunk: (parsed) => {
        const parts = (parsed as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })?.candidates?.[0]?.content?.parts
        if (!Array.isArray(parts)) return undefined
        for (const p of parts) if (typeof p.text === 'string') return p.text
        return undefined
      },
    }
  }

  // OpenAI-compatible providers: groq, openai, ollama
  let apiKey = ''
  let model = ''
  let baseUrl = ''
  let timeoutMs = 120000

  if (provider === 'groq') {
    apiKey = env.GROQ_API_KEY
    model = options.model || env.GROQ_MODEL
    baseUrl = env.GROQ_BASE_URL
    timeoutMs = env.GROQ_TIMEOUT_MS
    if (!apiKey) throw new ProviderError('Groq API key is missing. Set GROQ_API_KEY in your environment.')
  } else if (provider === 'openai') {
    apiKey = env.OPENAI_API_KEY
    model = options.model || env.OPENAI_MODEL
    baseUrl = env.OPENAI_BASE_URL
    timeoutMs = env.OPENAI_TIMEOUT_MS
    if (!apiKey) throw new ProviderError('OpenAI API key is missing. Set OPENAI_API_KEY in your environment.')
  } else {
    // ollama — local, no auth
    apiKey = ''
    model = options.model || env.OLLAMA_MODEL
    baseUrl = env.OLLAMA_BASE_URL
    timeoutMs = env.OLLAMA_TIMEOUT_MS
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

  return {
    apiKey,
    model,
    baseUrl,
    endpoint: `${baseUrl}/chat/completions`,
    body: {
      model,
      messages: options.messages,
      temperature,
      top_p: topP,
      max_tokens: maxTokens,
      stream: true,
    },
    headers,
    timeoutMs,
    extractChunk: (parsed) => {
      const delta = (parsed as { choices?: Array<{ delta?: { content?: string } }> })?.choices?.[0]?.delta?.content
      return typeof delta === 'string' ? delta : undefined
    },
  }
}

/**
 * Sends a streaming chat completion request to the configured AI provider.
 * Retries on 429 with exponential backoff (honors `retry-after` header).
 */
export async function generateStream(
  options: StreamOptions,
  onChunk: (chunk: string) => void,
  deadlineMs?: number
): Promise<void> {
  const provider = env.LLM_PROVIDER.toLowerCase() as ProviderName
  console.log(`[generateStream] Selected Provider: ${provider}`)

  if (provider !== 'gemini' && provider !== 'groq' && provider !== 'openai' && provider !== 'ollama') {
    const errorMsg = `Unsupported LLM_PROVIDER: "${env.LLM_PROVIDER}"`
    console.error(`[generateStream] Error: ${errorMsg}`)
    throw new ProviderError(errorMsg)
  }
  const cfg = buildProviderConfig(provider, options)
  const startedAt = Date.now()

  console.log(`[generateStream] Selected Model: ${cfg.model}`)
  console.log(`[generateStream] API Key present: ${!!cfg.apiKey}`)
  console.log(`[generateStream] Outgoing API URL: ${cfg.endpoint}`)

  // Create sanitized headers for logging
  const sanitizedHeaders = { ...cfg.headers }
  if (sanitizedHeaders['Authorization']) {
    sanitizedHeaders['Authorization'] = 'Bearer [REDACTED]'
  }
  if (sanitizedHeaders['x-goog-api-key']) {
    sanitizedHeaders['x-goog-api-key'] = '[REDACTED]'
  }
  console.log(`[generateStream] Outgoing Headers:`, JSON.stringify(sanitizedHeaders, null, 2))
  console.log(`[generateStream] Outgoing Request Body Structure:`, JSON.stringify({
    ...cfg.body,
    messages: (cfg.body.messages as any)?.map((m: any) => ({
      role: m.role,
      contentLength: m.content?.length
    })) || 'not-present'
  }, null, 2))

  let attempts = 0
  const maxAttempts = 5
  let baseDelay = 3000
  let response: Response | null = null

  while (attempts < maxAttempts) {
    // If a deadline is set and we're close to it, stop retrying.
    if (deadlineMs) {
      const elapsed = Date.now() - startedAt
      if (elapsed > deadlineMs) {
        throw new ProviderError(`${provider} request aborted: deadline of ${deadlineMs}ms exceeded after ${elapsed}ms`)
      }
      // If the next attempt's minimum wait would push us past the deadline, don't retry.
      if (attempts > 0 && elapsed + baseDelay > deadlineMs) {
        throw new ProviderError(`${provider} request aborted: retry would exceed deadline of ${deadlineMs}ms`)
      }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => {
      console.warn(`[generateStream] Request timeout triggered for ${provider} after ${cfg.timeoutMs}ms`)
      controller.abort()
    }, cfg.timeoutMs)

    try {
      console.log(`[generateStream] Sending request to ${provider} (attempt ${attempts + 1}/${maxAttempts})`)
      response = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: cfg.headers,
        body: JSON.stringify(cfg.body),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      console.log(`[generateStream] Outgoing HTTP status code: ${response.status} (${response.statusText})`)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        console.error(`[generateStream] Outgoing API Error Response Body:`, errorText)

        let errorMessage = `${provider} request failed: HTTP ${response.status}`
        let isRateLimit = response.status === 429
        let errorCode = ''

        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error?.message) errorMessage = `${provider} request failed: ${errorJson.error.message}`
          if (errorJson.error?.code) errorCode = errorJson.error.code
          if (errorCode === 'rate_limit_exceeded' || errorJson.error?.type === 'tokens') {
            isRateLimit = true
          }
        } catch {
          errorMessage = `${provider} request failed: ${errorText}`
        }

        if (isRateLimit && attempts < maxAttempts - 1) {
          attempts++
          const retryAfter = response.headers.get('retry-after')
          const xResetTokens = response.headers.get('x-ratelimit-reset-tokens')

          let waitMs = baseDelay
          if (retryAfter) {
            const seconds = parseFloat(retryAfter)
            if (!isNaN(seconds)) waitMs = (seconds + 1) * 1000
          } else if (xResetTokens) {
            const match = xResetTokens.match(/(?:(\d+)m)?(?:([\d.]+)s)?(?:(\d+)ms)?/)
            if (match) {
              const minutes = parseFloat(match[1] || '0')
              const seconds = parseFloat(match[2] || '0')
              const ms = parseFloat(match[3] || '0')
              const totalMs = (minutes * 60 + seconds) * 1000 + ms
              if (totalMs > 0) waitMs = totalMs + 1000 // add 1s safety buffer
            }
          }
          // Cap wait to stay within deadline.
          if (deadlineMs) {
            const elapsed = Date.now() - startedAt
            const maxWait = deadlineMs - elapsed - 5000 // reserve 5s for the actual request
            if (waitMs > maxWait) waitMs = Math.max(1000, maxWait)
          }
          console.warn(`[generateStream] [${provider}] Rate limited (${errorCode || response.status}). Retrying in ${waitMs}ms (attempt ${attempts}/${maxAttempts}).`)
          await new Promise((r) => setTimeout(r, waitMs))
          baseDelay *= 2
          continue
        }

        throw new ProviderError(errorMessage, response.status)
      }
      break
    } catch (err) {
      clearTimeout(timeout)
      if (err instanceof ProviderError) {
        console.error(`[generateStream] ProviderError thrown:`, err.message)
        throw err
      }
      const error = err as Error
      console.error(`[generateStream] Exception during fetch/request execution:`, error.message, error.stack)
      if (error.name === 'AbortError') {
        throw new ProviderError(`${provider} request timed out after ${cfg.timeoutMs}ms`)
      }
      if (attempts < maxAttempts - 1) {
        attempts++
        console.warn(`[generateStream] [${provider}] Request failed. Retrying in ${baseDelay}ms.`, error.message)
        await new Promise((r) => setTimeout(r, baseDelay))
        baseDelay *= 2
        continue
      }
      throw new ProviderError(`${provider} request failed: ${error.message}`)
    }
  }

  if (!response || !response.body) {
    console.error(`[generateStream] Error: ${provider} response body is empty`)
    throw new ProviderError(`${provider} response body is empty`)
  }

  console.log(`[generateStream] Stream response is ok. Commencing stream reading.`)
  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  let chunkCount = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      console.log(`[generateStream] Stream parsing finished. Total chunks extracted: ${chunkCount}`)
      break
    }
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith(':')) {
        if (trimmed.startsWith(':')) {
          console.log(`[generateStream] Keep-alive/comment line received: ${trimmed}`)
        }
        continue
      }
      let dataLine = trimmed
      if (dataLine.startsWith('data:')) dataLine = dataLine.slice(5).trim()
      if (dataLine === '[DONE]') {
        console.log(`[generateStream] Received streaming [DONE] sentinel.`)
        return
      }
      try {
        const parsed = JSON.parse(dataLine)
        const text = cfg.extractChunk(parsed)
        if (text) {
          chunkCount++
          if (chunkCount <= 5 || chunkCount % 50 === 0) {
            console.log(`[generateStream] Extracted chunk #${chunkCount}: "${text.slice(0, 50)}${text.length > 50 ? '...' : ''}"`)
          }
          onChunk(text)
        }
      } catch (parseErr: any) {
        console.warn(`[generateStream] Ignored line parsing error or non-JSON line:`, dataLine, parseErr.message)
      }
    }
  }
}