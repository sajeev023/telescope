function parseEnvInt(value: string | undefined, fallback: number): number {
  const n = parseInt(value || '', 10)
  return isNaN(n) ? fallback : n
}

export const env = {
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  GEMINI_TIMEOUT_MS: parseEnvInt(process.env.GEMINI_TIMEOUT_MS, 120000),
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  GROQ_BASE_URL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  GROQ_TIMEOUT_MS: parseEnvInt(process.env.GROQ_TIMEOUT_MS, 120000),
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_TIMEOUT_MS: parseEnvInt(process.env.OLLAMA_TIMEOUT_MS, 300000),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  OPENAI_TIMEOUT_MS: parseEnvInt(process.env.OPENAI_TIMEOUT_MS, 120000),
  // Maximum total content size accepted by /api/analyze, in characters
  // across all uploaded files. ~800K chars ≈ 200K tokens, which is the
  // upper bound of Gemini 2.0 Flash's context window.
  MAX_TOTAL_CONTENT_CHARS: parseEnvInt(process.env.MAX_TOTAL_CONTENT_CHARS, 800_000),
  // Maximum number of files accepted in a single /api/analyze request.
  MAX_FILES: parseEnvInt(process.env.MAX_FILES, 50),
}

export function validateEnv(): string[] {
  const warnings: string[] = []
  const provider = env.LLM_PROVIDER.toLowerCase()

  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) warnings.push('GEMINI_API_KEY is not set. Gemini API calls will fail.')
  } else if (provider === 'groq') {
    if (!env.GROQ_API_KEY) warnings.push('GROQ_API_KEY is not set. Groq API calls will fail.')
  } else if (provider === 'openai') {
    if (!env.OPENAI_API_KEY) warnings.push('OPENAI_API_KEY is not set. OpenAI API calls will fail.')
  } else if (provider === 'ollama') {
    // Ollama runs locally and usually doesn't require an API key
  } else {
    warnings.push(`Unknown LLM_PROVIDER: "${env.LLM_PROVIDER}". Expected one of: gemini, groq, ollama, openai.`)
  }

  return warnings
}