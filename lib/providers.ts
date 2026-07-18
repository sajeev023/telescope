import { env } from './env'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface StreamOptions {
  model?: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
}

export class ProviderError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ProviderError'
  }
}

/**
 * Logs provider details before the call per requirements.
 * NEVER prints the actual key.
 */
function logProviderDetails(
  provider: string,
  model: string,
  apiKey: string,
  baseUrl: string
) {
  console.log('Provider:', provider)
  console.log('Model:', model)
  console.log('API Key exists:', !!apiKey)
  console.log('API Key length:', apiKey.length)
  console.log('Base URL:', baseUrl)
}

/**
 * Sends a streaming chat completion request to the configured AI provider.
 */
export async function generateStream(
  options: StreamOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  const provider = env.LLM_PROVIDER.toLowerCase()

  if (provider === 'gemini') {
    await generateGeminiStream(options, onChunk)
  } else if (provider === 'groq') {
    await generateOpenAICompatibleStream('groq', options, onChunk)
  } else if (provider === 'openai') {
    await generateOpenAICompatibleStream('openai', options, onChunk)
  } else if (provider === 'ollama') {
    await generateOpenAICompatibleStream('ollama', options, onChunk)
  } else {
    throw new ProviderError(`Unsupported LLM_PROVIDER: "${env.LLM_PROVIDER}"`)
  }
}

/**
 * Google Gemini Rest API SSE implementation
 */
async function generateGeminiStream(
  options: StreamOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  const apiKey = env.GEMINI_API_KEY
  if (!apiKey) {
    throw new ProviderError('Gemini API key is missing. Set GEMINI_API_KEY in your environment.')
  }

  const model = options.model || env.GEMINI_MODEL
  const baseUrl = 'https://generativelanguage.googleapis.com'
  
  // Step 4 Logging
  logProviderDetails('gemini', model, apiKey, baseUrl)

  const endpoint = `${baseUrl}/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`

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

  let attempts = 0
  const maxAttempts = 5
  let baseDelay = 3000
  let response: Response | null = null

  while (attempts < maxAttempts) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), env.GEMINI_TIMEOUT_MS)

    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        if (response.status === 429 && attempts < maxAttempts - 1) {
          attempts++
          const retryAfter = response.headers.get('retry-after')
          let waitMs = baseDelay
          if (retryAfter) {
            const seconds = parseFloat(retryAfter)
            if (!isNaN(seconds)) {
              waitMs = (seconds + 1) * 1000
            }
          }
          console.warn(`[Gemini Provider] Rate limited (429). Retrying in ${waitMs}ms (attempt ${attempts}/${maxAttempts})...`)
          await new Promise((r) => setTimeout(r, waitMs))
          baseDelay *= 2
          continue
        }

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
        throw new ProviderError(errorMessage, response.status)
      }

      break
    } catch (err) {
      clearTimeout(timeout)
      if (err instanceof ProviderError) {
        throw err
      }
      const error = err as Error
      if (error.name === 'AbortError') {
        throw new ProviderError(`Gemini request timed out after ${env.GEMINI_TIMEOUT_MS}ms`)
      }
      if (attempts < maxAttempts - 1) {
        attempts++
        console.warn(`[Gemini Provider] Request failed. Retrying in ${baseDelay}ms...`, error.message)
        await new Promise((r) => setTimeout(r, baseDelay))
        baseDelay *= 2
        continue
      }
      throw new ProviderError(`Gemini request failed: ${error.message}`)
    }
  }

  if (!response || !response.body) {
    throw new ProviderError('Gemini response body is empty')
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
  }

/**
 * OpenAI, Groq, and Ollama compatible chat completion SSE stream implementation
 */
async function generateOpenAICompatibleStream(
  provider: 'groq' | 'openai' | 'ollama',
  options: StreamOptions,
  onChunk: (chunk: string) => void
): Promise<void> {
  let apiKey = ''
  let model = ''
  let baseUrl = ''

  if (provider === 'groq') {
    apiKey = env.GROQ_API_KEY
    model = options.model || env.GROQ_MODEL
    baseUrl = env.GROQ_BASE_URL
    if (!apiKey) {
      throw new ProviderError('Groq API key is missing. Set GROQ_API_KEY in your environment.')
    }
  } else if (provider === 'openai') {
    apiKey = env.OPENAI_API_KEY
    model = options.model || env.OPENAI_MODEL
    baseUrl = env.OPENAI_BASE_URL
    if (!apiKey) {
      throw new ProviderError('OpenAI API key is missing. Set OPENAI_API_KEY in your environment.')
    }
  } else {
    // ollama
    apiKey = 'not-required' // Ollama runs locally without authentication usually
    model = options.model || env.OLLAMA_MODEL
    baseUrl = env.OLLAMA_BASE_URL
  }

  // Step 4 Logging
  logProviderDetails(provider, model, apiKey, baseUrl)

  const endpoint = `${baseUrl}/chat/completions`

  const body = {
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.1,
    max_tokens: options.maxTokens ?? 8192,
    stream: true,
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey && apiKey !== 'not-required') {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  let attempts = 0
  const maxAttempts = 5
  let baseDelay = 3000
  let response: Response | null = null

  while (attempts < maxAttempts) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), env.GEMINI_TIMEOUT_MS)

    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        if (response.status === 429 && attempts < maxAttempts - 1) {
          attempts++
          const retryAfter = response.headers.get('retry-after')
          let waitMs = baseDelay
          if (retryAfter) {
            const seconds = parseFloat(retryAfter)
            if (!isNaN(seconds)) {
              waitMs = (seconds + 1) * 1000
            }
          }
          console.warn(`[${provider} Provider] Rate limited (429). Retrying in ${waitMs}ms (attempt ${attempts}/${maxAttempts})...`)
          await new Promise((r) => setTimeout(r, waitMs))
          baseDelay *= 2
          continue
        }

        const errorText = await response.text().catch(() => 'Unknown error')
        let errorMessage = `${provider} request failed: HTTP ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          if (errorJson.error?.message) {
            errorMessage = `${provider} request failed: ${errorJson.error.message}`
          }
        } catch {
          errorMessage = `${provider} request failed: ${errorText}`
        }
        throw new ProviderError(errorMessage, response.status)
      }

      break
    } catch (err) {
      clearTimeout(timeout)
      if (err instanceof ProviderError) {
        throw err
      }
      const error = err as Error
      if (error.name === 'AbortError') {
        throw new ProviderError(`${provider} request timed out`)
      }
      if (attempts < maxAttempts - 1) {
        attempts++
        console.warn(`[${provider} Provider] Request failed. Retrying in ${baseDelay}ms...`, error.message)
        await new Promise((r) => setTimeout(r, baseDelay))
        baseDelay *= 2
        continue
      }
      throw new ProviderError(`${provider} request failed: ${error.message}`)
    }
  }

  if (!response || !response.body) {
    throw new ProviderError(`${provider} response body is empty`)
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
        if (!trimmed) continue

        let dataLine = trimmed
        if (dataLine.startsWith('data:')) {
          dataLine = dataLine.slice(5).trim()
        }
        if (dataLine === '[DONE]') break

        try {
          const parsed = JSON.parse(dataLine)
          const text = parsed.choices?.[0]?.delta?.content
          if (text) {
            onChunk(text)
          }
        } catch {
          // ignore non-JSON lines
        }
      }
    }
  }
