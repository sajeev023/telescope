// Storage layer for Telescope.
//
// Two storage tiers:
//   1. sessionStorage — in-progress files being uploaded. Cleared when
//      the tab closes. Used by the upload and thinking pages.
//   2. localStorage — saved reports with UUIDs. Persist across sessions.
//      Used by the report page, the reports history page, and the
//      shareable URL flow (/report?id=<uuid>).
//
// The old `report` / `telescope_report` and `files` / `transcripts`
// duplicated keys are gone — we use one key each now.

import reportData from '@/public/data/report.json'
import type { Report } from '@/types/report'
import { type LoadedFile } from './demo'

const FILES_KEY = 'telescope:files'
const CURRENT_REPORT_KEY = 'telescope:current-report'
const REPORTS_INDEX_KEY = 'telescope:reports-index'

// ---------------------------------------------------------------------------
// Files (session storage — in-progress uploads)
// ---------------------------------------------------------------------------

export function saveFiles(files: LoadedFile[]): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(FILES_KEY, JSON.stringify(files))
  } catch (err) {
    console.error('Failed to save files to sessionStorage:', err)
  }
}

export function getStoredFiles(): LoadedFile[] {
  if (typeof window === 'undefined') return []
  const raw = sessionStorage.getItem(FILES_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as LoadedFile[]
  } catch {
    /* ignore */
  }
  return []
}

export function clearFiles(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(FILES_KEY)
}

// ---------------------------------------------------------------------------
// Reports (localStorage — persistent, with UUIDs)
// ---------------------------------------------------------------------------

export type ReportIndexEntry = {
  id: string
  project_name: string
  generated_at: string
  sources_analyzed: number
  insights_extracted: number
  themes_identified: number
  segments_detected: string[]
  created_at: string
  demo?: boolean
}

function safeLocalStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function readIndex(): ReportIndexEntry[] {
  const ls = safeLocalStorage()
  if (!ls) return []
  const raw = ls.getItem(REPORTS_INDEX_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as ReportIndexEntry[]
  } catch {
    /* ignore */
  }
  return []
}

function writeIndex(entries: ReportIndexEntry[]): void {
  const ls = safeLocalStorage()
  if (!ls) return
  try {
    ls.setItem(REPORTS_INDEX_KEY, JSON.stringify(entries))
  } catch (err) {
    console.error('Failed to write reports index:', err)
  }
}

function reportKey(id: string): string {
  return `telescope:report:${id}`
}

/**
 * Save a report to localStorage. Returns the UUID so callers can
 * construct a shareable URL.
 */
export function saveReport(report: Report): string {
  const ls = safeLocalStorage()
  if (!ls) return ''

  const id = uuid()
  const metadata = report.report_metadata
  const entry: ReportIndexEntry = {
    id,
    project_name: metadata.project_name,
    generated_at: metadata.generated_at,
    sources_analyzed: metadata.sources_analyzed,
    insights_extracted: metadata.insights_extracted,
    themes_identified: metadata.themes_identified,
    segments_detected: metadata.segments_detected,
    created_at: new Date().toISOString(),
  }

  try {
    ls.setItem(reportKey(id), JSON.stringify(report))
  } catch (err) {
    console.error('Failed to save report to localStorage:', err)
    return ''
  }

  const entries = readIndex()
  entries.unshift(entry)
  // Cap at 50 saved reports to stay within localStorage quota.
  const capped = entries.slice(0, 50)
  // Trim removed reports from localStorage to free quota.
  for (const e of entries.slice(50)) {
    try { ls.removeItem(reportKey(e.id)) } catch { /* ignore */ }
  }
  writeIndex(capped)

  return id
}

export function getReportById(id: string): Report | null {
  const ls = safeLocalStorage()
  if (!ls) return null
  const raw = ls.getItem(reportKey(id))
  if (!raw) return null
  try {
    return JSON.parse(raw) as Report
  } catch {
    return null
  }
}

export function listReports(): ReportIndexEntry[] {
  return readIndex()
}

export function deleteReport(id: string): void {
  const ls = safeLocalStorage()
  if (!ls) return
  try { ls.removeItem(reportKey(id)) } catch { /* ignore */ }
  const entries = readIndex().filter((e) => e.id !== id)
  writeIndex(entries)
}

// ---------------------------------------------------------------------------
// Current report pointer (session storage — what /report renders by default)
// ---------------------------------------------------------------------------

export function setCurrentReportId(id: string): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(CURRENT_REPORT_KEY, id)
}

export function getCurrentReportId(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(CURRENT_REPORT_KEY)
}

export function clearCurrentReportId(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(CURRENT_REPORT_KEY)
}

/**
 * Convenience: load the report we should render on /report. Priority:
 *   1. ?id=<uuid> query param (shareable URL)
 *   2. session pointer (current report from the most recent run)
 *   3. the bundled demo report (fallback)
 */
export function getReportForRender(idParam: string | null | undefined): {
  report: Report | null
  id: string | null
  isDemo: boolean
} {
  if (idParam) {
    const found = getReportById(idParam)
    if (found) return { report: found, id: idParam, isDemo: false }
    // Explicit ?id= was provided but not found — don't silently fall back.
    return { report: null, id: null, isDemo: false }
  }
  const currentId = getCurrentReportId()
  if (currentId) {
    const found = getReportById(currentId)
    if (found) return { report: found, id: currentId, isDemo: false }
  }
  return { report: reportData as Report, id: null, isDemo: true }
}

/**
 * Persist a report produced by the streaming pipeline, set it as the
 * current report so /report renders it, and return the UUID so the
 * caller can navigate to /report?id=<uuid>. Wrapper around saveReport +
 * setCurrentReportId.
 */
export function saveReportFromStream(report: Report): string {
  const id = saveReport(report)
  if (id) setCurrentReportId(id)
  return id
}

/**
 * Save the bundled demo report to localStorage and return its new UUID,
 * so "View sample report" produces a stable shareable URL.
 */
export function saveDemoReport(): string {
  // Check if a demo report already exists in the index to avoid duplicates.
  const existing = readIndex().find((e) => e.demo)
  if (existing) {
    setCurrentReportId(existing.id)
    return existing.id
  }
  const id = saveReport(reportData as Report)
  if (id) {
    // Mark the entry as a demo so we can find it next time.
    const entries = readIndex()
    const idx = entries.findIndex((e) => e.id === id)
    if (idx !== -1) {
      entries[idx] = { ...entries[idx], demo: true }
      writeIndex(entries)
    }
  }
  return id
}