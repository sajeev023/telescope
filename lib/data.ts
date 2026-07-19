import type { Segment, Severity, Effort } from '@/types/report'

export function getSegmentColor(segment: Segment): string {
  switch (segment) {
    case 'smb':
      return '#E8B14E'
    case 'enterprise':
      return '#7BC74D'
    case 'freelancer':
      return '#9B7BD8'
    case 'general':
      return '#A7A29A'
    default:
      return '#A7A29A'
  }
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return '#E5534B'
    case 'high':
      return '#E88B4E'
    case 'medium':
      return '#E8B14E'
    case 'low':
      return '#7BC74D'
    case 'positive':
      return '#6BB6D9'
    default:
      return '#E8B14E'
  }
}

export function getEffortColor(effort: Effort): string {
  switch (effort) {
    case 'low':
      return '#7BC74D'
    case 'medium':
      return '#E8B14E'
    case 'high':
      return '#E5534B'
    default:
      return '#E8B14E'
  }
}