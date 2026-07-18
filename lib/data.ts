import reportData from '@/public/data/report.json'
import type { Report, Segment, Severity, Effort } from '@/types/report'

export const REPORT_STORAGE_KEY = 'report'
export const TELESCOPE_REPORT_STORAGE_KEY = 'telescope_report'
export const FILES_STORAGE_KEY = 'files'
export const TRANSCRIPTS_STORAGE_KEY = 'transcripts'

export function getReport(): Report {
  return reportData as Report
}

export function getStoredReport(): Report | null {
  if (typeof window === 'undefined') return null
  const raw =
    window.sessionStorage.getItem(REPORT_STORAGE_KEY) ||
    window.sessionStorage.getItem(TELESCOPE_REPORT_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Report
  } catch {
    return null
  }
}

export function saveReport(report: Report): void {
  if (typeof window === 'undefined') return
  const json = JSON.stringify(report)
  window.sessionStorage.setItem(REPORT_STORAGE_KEY, json)
  window.sessionStorage.setItem(TELESCOPE_REPORT_STORAGE_KEY, json)
}

export function clearStoredReport(): void {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(REPORT_STORAGE_KEY)
  window.sessionStorage.removeItem(TELESCOPE_REPORT_STORAGE_KEY)
}

export function getSegmentColor(segment: Segment): string {
  switch (segment) {
    case 'smb':
      return '#6C5CE7'
    case 'enterprise':
      return '#00C853'
    case 'freelancer':
      return '#FFD600'
  }
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return '#FF3D00'
    case 'high':
      return '#FF6D00'
    case 'medium':
      return '#FFD600'
    case 'low':
      return '#00C853'
  }
}

export function getEffortColor(effort: Effort): string {
  switch (effort) {
    case 'low':
      return '#00C853'
    case 'medium':
      return '#FFD600'
    case 'high':
      return '#FF3D00'
  }
}