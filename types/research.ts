export interface ResearchDocument {
  id: string
  title: string
  content: string
  uploadedAt: Date
  fileType: string
}

export interface SynthesisResult {
  id: string
  title: string
  summary: string
  keyInsights: string[]
  relatedTopics: string[]
  confidence: number
  createdAt: Date
}

export interface ThinkingState {
  status: 'idle' | 'processing' | 'complete' | 'error'
  progress: number
  message: string
  error?: string
}
