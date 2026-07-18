export const env = {
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  GEMINI_TIMEOUT_MS: parseInt(process.env.GEMINI_TIMEOUT_MS || '120000', 10),
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  GROQ_BASE_URL: process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1',
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || 'llama3',
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
}

export function validateEnv(): string[] {
  const warnings: string[] = []
  const provider = env.LLM_PROVIDER.toLowerCase()

  if (provider === 'gemini') {
    if (!env.GEMINI_API_KEY) {
      warnings.push('GEMINI_API_KEY is not set. Gemini API calls will fail.')
    }
  } else if (provider === 'groq') {
    if (!env.GROQ_API_KEY) {
      warnings.push('GROQ_API_KEY is not set. Groq API calls will fail.')
    }
  } else if (provider === 'openai') {
    if (!env.OPENAI_API_KEY) {
      warnings.push('OPENAI_API_KEY is not set. OpenAI API calls will fail.')
    }
  } else if (provider === 'ollama') {
    // Ollama runs locally and usually doesn't require an API key
  } else {
    warnings.push(`Unknown LLM_PROVIDER: "${env.LLM_PROVIDER}". Expected one of: gemini, groq, ollama, openai.`)
  }

  return warnings
}

if (typeof window === 'undefined') {
  const warnings = validateEnv()
  for (const w of warnings) {
    console.warn('[Telescope env]:', w)
  }
}

