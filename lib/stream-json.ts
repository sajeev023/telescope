// Streaming JSON insight extractor.
//
// The extraction LLM call returns a JSON object of the form:
//   { "insights": [ { "text": "...", "segment": "...", "source": "...", "confidence": 0.9 }, ... ], "segmentsDetected": [...] }
//
// As the model streams tokens, the buffer is incomplete JSON. We can't
// JSON.parse it. Instead, we scan for complete `{ ... }` object literals
// inside the `insights` array and parse each one individually. Each time
// a new complete object appears, we emit it as a live insight.
//
// This is what makes the "live insight feed" on the thinking page real.
// Insights appear as the model writes them, not after the whole response
// finishes.

export type PartialInsight = {
  text: string
  segment: string
  source: string
  confidence: number
}

/**
 * Walk the buffer and return every complete insight object found inside
 * the `insights` array. Objects are matched by balanced braces, with
 * string-aware scanning so braces inside string literals don't confuse
 * the parser.
 *
 * The returned array is the complete set of insights seen so far — callers
 * should diff against what they've already emitted to find new ones.
 */
export function extractCompleteInsights(buffer: string): PartialInsight[] {
  const insights: PartialInsight[] = []

  // Find the `insights` array. We look for `"insights"` followed by `:`
  // and then the opening `[`. This is robust to whitespace.
  const insightsKeyIdx = findInsightsKey(buffer)
  if (insightsKeyIdx === -1) return insights

  const arrayStart = buffer.indexOf('[', insightsKeyIdx)
  if (arrayStart === -1) return insights

  // Scan the array, pulling out top-level `{ ... }` objects.
  let i = arrayStart + 1
  const end = buffer.length
  while (i < end) {
    // Skip whitespace and commas.
    while (i < end && (buffer[i] === ' ' || buffer[i] === ',' || buffer[i] === '\n' || buffer[i] === '\r' || buffer[i] === '\t')) {
      i++
    }
    if (i >= end) break
    if (buffer[i] === ']') break // end of array
    if (buffer[i] !== '{') break // malformed — wait for more tokens

    const objStart = i
    const objEnd = findObjectEnd(buffer, objStart)
    if (objEnd === -1) break // object is incomplete — wait for more tokens

    const objText = buffer.slice(objStart, objEnd + 1)
    try {
      const parsed = JSON.parse(objText) as PartialInsight
      if (parsed && typeof parsed.text === 'string' && parsed.text.length > 0) {
        insights.push({
          text: parsed.text,
          segment: typeof parsed.segment === 'string' ? parsed.segment : 'general',
          source: typeof parsed.source === 'string' ? parsed.source : '',
          confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
        })
      }
    } catch {
      // Malformed object — skip it. This can happen if the model emits
      // a slightly weird object that happens to have balanced braces.
    }

    i = objEnd + 1
  }

  return insights
}

/**
 * Find the position of the `"insights"` key in the buffer. Returns the
 * index of the `i` in `insights`, or -1 if not found.
 */
function findInsightsKey(buffer: string): number {
  // Match `"insights"` as a JSON key. We require the preceding char to
  // be `{` or `,` (with optional whitespace) to avoid matching the word
  // inside a string value.
  for (let i = 0; i < buffer.length - 10; i++) {
    if (buffer[i] !== '"') continue
    if (buffer.slice(i + 1, i + 9) !== 'insights') continue
    if (buffer[i + 9] !== '"') continue
    // Look ahead for `:` (with optional whitespace).
    let j = i + 10
    while (j < buffer.length && (buffer[j] === ' ' || buffer[j] === '\n' || buffer[j] === '\r' || buffer[j] === '\t')) {
      j++
    }
    if (buffer[j] === ':') return i
  }
  return -1
}

/**
 * Given a buffer and the index of an opening `{`, find the matching
 * closing `}`. Returns -1 if the object is incomplete (we need more
// tokens). String-aware: braces inside string literals are ignored.
 */
function findObjectEnd(buffer: string, start: number): number {
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < buffer.length; i++) {
    const ch = buffer[i]
    if (inString) {
      if (escape) {
        escape = false
      } else if (ch === '\\') {
        escape = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }
    if (ch === '"') {
      inString = true
    } else if (ch === '{') {
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

/**
 * Extract the `segmentsDetected` array from a complete or partial
 * buffer. Returns null if the array isn't parseable yet.
 */
export function extractSegmentsDetected(buffer: string): string[] | null {
  const keyIdx = buffer.indexOf('"segmentsDetected"')
  if (keyIdx === -1) return null
  const colon = buffer.indexOf(':', keyIdx)
  if (colon === -1) return null
  const arrStart = buffer.indexOf('[', colon)
  if (arrStart === -1) return null
  const arrEnd = buffer.indexOf(']', arrStart)
  if (arrEnd === -1) return null
  try {
    const parsed = JSON.parse(buffer.slice(arrStart, arrEnd + 1)) as string[]
    if (Array.isArray(parsed)) return parsed
  } catch {
    return null
  }
  return null
}