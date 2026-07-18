import { env } from './env'

export interface OllamaChatOptions {
  model?: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  maxTokens?: number
}

export class OllamaError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'OllamaError'
  }
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getEndpointUrl(baseUrl: string): string {
  const cleanUrl = baseUrl.replace(/\/+$/, '')
  if (
    cleanUrl.endsWith('/chat/completions') ||
    cleanUrl.endsWith('/api/generate') ||
    cleanUrl.endsWith('/api/chat')
  ) {
    return cleanUrl
  }
  if (cleanUrl.endsWith('/v1') || cleanUrl.includes('/v1/')) {
    return `${cleanUrl}/chat/completions`
  }
  return `${cleanUrl}/api/generate`
}

/**
 * Primary Provider: Groq Cloud API
 */
async function generateGroqStream(
  options: OllamaChatOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  const model = options.model || env.GROQ_MODEL || 'llama-3.3-70b-versatile'
  const baseUrl = env.GROQ_BASE_URL.replace(/\/+$/, '')
  const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), env.OLLAMA_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: options.messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 8192,
        stream: true,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new OllamaError(`Groq API error ${response.status}: ${errorText}`, response.status)
    }

    if (!response.body) {
      throw new OllamaError('Groq response body is empty')
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
          const content = parsed.choices?.[0]?.delta?.content || ''
          if (content) {
            onChunk(content)
          }
        } catch {
          // ignore non-json lines
        }
      }
    }
  } catch (err) {
    clearTimeout(timeout)
    throw err
  }
}

/**
 * Secondary Fallback Provider: Ollama (Cloud or Local)
 */
async function generateOllamaNativeStream(
  options: OllamaChatOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  const model = options.model || env.OLLAMA_DEFAULT_MODEL
  const endpoint = getEndpointUrl(env.OLLAMA_BASE_URL)
  const isChatCompletions = endpoint.endsWith('/chat/completions')

  let attempt = 0
  let lastError: unknown

  while (attempt <= env.OLLAMA_MAX_RETRIES) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), env.OLLAMA_TIMEOUT_MS)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (env.OLLAMA_API_KEY) {
        headers['Authorization'] = `Bearer ${env.OLLAMA_API_KEY}`
      }

      const bodyPayload = isChatCompletions
        ? {
            model,
            messages: options.messages,
            temperature: options.temperature ?? 0.3,
            max_tokens: options.maxTokens ?? 4096,
            stream: true,
          }
        : {
            model,
            prompt: options.messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n'),
            system: options.messages.find((m) => m.role === 'system')?.content,
            stream: true,
            options: {
              temperature: options.temperature ?? 0.3,
            },
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new OllamaError(`Ollama API error ${response.status}: ${errorText}`, response.status)
      }

      if (!response.body) {
        throw new OllamaError('Ollama response body is empty')
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
            const content =
              parsed.choices?.[0]?.delta?.content ||
              parsed.response ||
              parsed.message?.content ||
              ''
            if (content) {
              onChunk(content)
            }
          } catch {
            // ignore
          }
        }
      }

      return
    } catch (error: unknown) {
      clearTimeout(timeout)
      const err = error as Error
      const isAbort = err.name === 'AbortError'
      lastError = isAbort
        ? new OllamaError(`Request timeout after ${env.OLLAMA_TIMEOUT_MS}ms`)
        : error

      attempt++
      if (attempt <= env.OLLAMA_MAX_RETRIES) {
        const backoffMs = Math.pow(2, attempt) * 500
        await sleep(backoffMs)
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

/**
 * Main Stream Entry Point: Priority Groq -> Fallback Ollama
 */
export async function generateOllamaStream(
  options: OllamaChatOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  // 1st Priority: Groq if configured or specified as provider
  if (env.LLM_PROVIDER === 'groq' || env.GROQ_API_KEY) {
    try {
      console.log('[LLM API] Attempting Groq API with model:', env.GROQ_MODEL || 'llama-3.3-70b-versatile')
      await generateGroqStream(options, onChunk)
      console.log('[LLM API] Groq API streaming successful.')
      return
    } catch (groqError: unknown) {
      const msg = groqError instanceof Error ? groqError.message : String(groqError)
      console.warn('[LLM API] Groq primary provider failed. Falling back to Ollama:', msg)
    }
  }

  // 2nd Priority: Ollama fallback
  console.log('[LLM API] Attempting Ollama fallback API...')
  await generateOllamaNativeStream(options, onChunk)
}
