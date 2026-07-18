'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { FILES_STORAGE_KEY, TRANSCRIPTS_STORAGE_KEY } from '@/lib/data'

const DEMO_FILES = [
  { name: 'interview-smb-1.txt', path: '/demo/interview-smb-1.txt' },
  { name: 'interview-smb-2.txt', path: '/demo/interview-smb-2.txt' },
  { name: 'interview-enterprise-1.txt', path: '/demo/interview-enterprise-1.txt' },
  { name: 'interview-enterprise-2.txt', path: '/demo/interview-enterprise-2.txt' },
  { name: 'interview-freelancer.txt', path: '/demo/interview-freelancer.txt' },
]

type SelectedFile = {
  id: string
  name: string
  size: string
  content?: string
}

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved =
        sessionStorage.getItem(FILES_STORAGE_KEY) ||
        sessionStorage.getItem(TRANSCRIPTS_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFiles(parsed)
          }
        } catch {
          // ignore parse error
        }
      }
    }
  }, [])

  const saveToSession = (filesToSave: SelectedFile[]) => {
    if (typeof window !== 'undefined') {
      const json = JSON.stringify(filesToSave)
      sessionStorage.setItem(FILES_STORAGE_KEY, json)
      sessionStorage.setItem(TRANSCRIPTS_STORAGE_KEY, json)
    }
  }

  const loadDemoFiles = useCallback(async () => {
    setIsLoadingDemo(true)
    setLoadError(null)

    try {
      const results: SelectedFile[] = []
      for (let i = 0; i < DEMO_FILES.length; i++) {
        const df = DEMO_FILES[i]
        const response = await fetch(df.path)
        if (!response.ok) {
          throw new Error(`Failed to load ${df.name} (status ${response.status})`)
        }
        const content = await response.text()
        const sizeKB = (new Blob([content]).size / 1024).toFixed(1)
        results.push({
          id: `${df.name}-${i}-${Date.now()}`,
          name: df.name,
          size: `${sizeKB} KB`,
          content,
        })
      }
      setFiles(results)
      saveToSession(results)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load demo transcripts'
      setLoadError(message)
      console.error('Failed to load demo files:', err)
    } finally {
      setIsLoadingDemo(false)
    }
  }, [])

  const readRealFiles = async (fileList: FileList | File[]) => {
    const newFiles: SelectedFile[] = []
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i]
      let textContent = ''
      try {
        textContent = await file.text()
      } catch (err) {
        console.error('Failed to read file:', file.name, err)
      }
      const formattedSize =
        file.size < 1024
          ? `${file.size} B`
          : `${(file.size / 1024).toFixed(1)} KB`

      newFiles.push({
        id: `${file.name}-${i}-${Date.now()}`,
        name: file.name,
        size: formattedSize,
        content: textContent,
      })
    }

    if (newFiles.length > 0) {
      setFiles((prev) => {
        const updated = [...prev, ...newFiles]
        saveToSession(updated)
        return updated
      })
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id)
      saveToSession(updated)
      return updated
    })
  }

  const clearAll = () => {
    setFiles([])
    setLoadError(null)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(FILES_STORAGE_KEY)
      sessionStorage.removeItem(TRANSCRIPTS_STORAGE_KEY)
    }
  }

  const handleStart = () => {
    saveToSession(files)
    router.push('/thinking')
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await readRealFiles(e.dataTransfer.files)
    } else {
      await loadDemoFiles()
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleZoneClick = () => {
    inputRef.current?.click()
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await readRealFiles(e.target.files)
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-accent/10 border border-accent/20 text-accent text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Research Synthesis</span>
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-3">
            Upload your research
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Drop your source documents below. We&apos;ll read, cluster, and
            synthesize them into a boardroom-ready report.
          </p>
        </motion.div>

        {loadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm text-center"
          >
            {loadError}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {files.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                type="button"
                onClick={handleZoneClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full rounded-2xl border-2 border-dashed transition-colors px-8 py-20 flex flex-col items-center justify-center gap-4 bg-surface ${
                  isDragging
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50'
                }`}
              >
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-accent" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-text-primary mb-1">
                    Drop files here, or click to load sources
                  </p>
                  <p className="text-sm text-text-secondary">
                    TXT files or transcripts will be loaded for analysis
                  </p>
                </div>
              </motion.button>
              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={loadDemoFiles}
                  disabled={isLoadingDemo}
                  className="text-xs text-text-secondary hover:text-accent underline transition-colors disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {isLoadingDemo && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isLoadingDemo ? 'Loading demo transcripts...' : 'Or click here to load 5 sample demo files'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border bg-surface overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-text-secondary" />
                    <span className="text-sm font-medium text-text-primary">
                      {files.length} {files.length === 1 ? 'file' : 'files'}{' '}
                      ready
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <ul className="divide-y divide-border">
                  {files.map((file, i) => (
                    <motion.li
                      key={file.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.08 }}
                      className="group px-6 py-4 flex items-center gap-4 hover:bg-surface-raised transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {file.size}
                        </p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-md bg-success/10 text-success border border-success/20">
                        Ready
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-error/10 text-text-secondary hover:text-error"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleZoneClick}
                  className="px-4 py-3 rounded-2xl border border-border bg-surface hover:bg-surface-raised text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  + Add more files
                </button>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: files.length * 0.08 }}
                  type="button"
                  onClick={handleStart}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Analysis
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".txt,.json,.csv,.md,text/plain"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
