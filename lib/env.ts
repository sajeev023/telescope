export const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  GEMINI_TIMEOUT_MS: parseInt(process.env.GEMINI_TIMEOUT_MS || '120000', 10),
}

export function validateEnv(): string[] {
  const warnings: string[] = []

  if (!env.GEMINI_API_KEY) {
    warnings.push('GEMINI_API_KEY is not set. Gemini API calls will fail without authentication.')
  }

  return warnings
}

if (typeof window === 'undefined') {
  const warnings = validateEnv()
  for (const w of warnings) {
    console.warn('[Telescope env]:', w)
  }
}
