export const env = {
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'groq',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  GROQ_BASE_URL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OLLAMA_API_KEY: process.env.OLLAMA_API_KEY || '',
  OLLAMA_DEFAULT_MODEL: process.env.OLLAMA_DEFAULT_MODEL || 'llama3',
  OLLAMA_TIMEOUT_MS: parseInt(process.env.OLLAMA_TIMEOUT_MS || '60000', 10),
  OLLAMA_MAX_RETRIES: parseInt(process.env.OLLAMA_MAX_RETRIES || '1', 10),
}

export function validateEnv(): string[] {
  const warnings: string[] = []

  if (env.LLM_PROVIDER === 'groq' && !env.GROQ_API_KEY) {
    warnings.push('GROQ_API_KEY is not set. Groq API calls will fail without authentication.')
  }

  return warnings
}

if (typeof window === 'undefined') {
  const warnings = validateEnv()
  for (const w of warnings) {
    console.warn('[Telescope env]:', w)
  }
}
