'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  X,
  ArrowRight,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  ArrowUpRight,
} from 'lucide-react'
import { saveFiles, getStoredFiles, clearFiles } from '@/lib/storage'
import { loadDemoFiles, readRealFiles, type LoadedFile } from '@/lib/demo'
import { TelescopeMark } from '@/components/site/Logo'

type SelectedFile = LoadedFile

export default function UploadPage() {
  const router = useRouter()
  const [files, setFiles] = useState<SelectedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isLoadingDemo, setIsLoadingDemo] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const stored = getStoredFiles()
    if (stored.length > 0) setFiles(stored)
  }, [])

  const handleLoaded = (next: SelectedFile[]) => {
    setFiles(next)
    saveFiles(next)
  }

  const loadDemoFilesHandler = async () => {
    setIsLoadingDemo(true)
    setLoadError(null)
    try {
      const results = await loadDemoFiles()
      handleLoaded(results)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load demo transcripts'
      setLoadError(message)
      console.error('Failed to load demo files:', err)
    } finally {
      setIsLoadingDemo(false)
    }
  }

  const readRealFilesHandler = async (fileList: FileList | File[]) => {
    const newFiles = await readRealFiles(fileList)
    if (newFiles.length > 0) {
      setFiles((prev) => {
        const updated = [...prev, ...newFiles]
        saveFiles(updated)
        return updated
      })
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id)
      saveFiles(updated)
      return updated
    })
  }

  const clearAll = () => {
    setFiles([])
    setLoadError(null)
    clearFiles()
  }

  const handleStart = () => {
    saveFiles(files)
    router.push('/thinking')
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await readRealFilesHandler(e.dataTransfer.files)
    } else {
      await loadDemoFilesHandler()
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
      await readRealFilesHandler(e.target.files)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="aurora-glow animate-aurora-slow"
          style={{
            left: '15%',
            top: '0%',
            width: '50%',
            height: '60%',
            background: 'radial-gradient(circle, rgba(232,177,78,0.1), transparent 70%)',
          }}
        />
        <div className="absolute inset-0 bg-dotgrid opacity-30 mask-fade-b" />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface/60 backdrop-blur-sm text-xs uppercase tracking-editorial-wide text-text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Step 01 · Ingest
          </div>
          <h1 className="editorial-display text-display-lg mt-6 text-text-primary text-balance">
            Bring your{' '}
            <span className="serif-italic text-accent">sources</span>{' '}
            into the lens.
          </h1>
          <p className="text-text-secondary mt-5 max-w-xl mx-auto text-pretty">
            Drop interview transcripts, support calls, meeting notes — anything
            text. Telescope will read every source end-to-end and synthesize a
            boardroom-ready report.
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
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.button
                type="button"
                onClick={handleZoneClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
                className={`group relative w-full rounded-3xl border-2 border-dashed transition-all duration-300 px-8 py-20 flex flex-col items-center justify-center gap-5 bg-surface/40 backdrop-blur-sm ${
                  isDragging
                    ? 'border-accent bg-accent/5 shadow-glow-accent'
                    : 'border-border hover:border-accent/40'
                }`}
              >
                <div className="relative">
                  <div
                    className={`absolute inset-0 rounded-full transition-opacity duration-500 ${
                      isDragging ? 'bg-accent/20 blur-2xl opacity-100' : 'opacity-0'
                    }`}
                  />
                  <div className="relative w-20 h-20 rounded-3xl bg-surface-raised border border-border flex items-center justify-center text-accent group-hover:scale-105 transition-transform duration-500 ease-editorial">
                    <TelescopeMark className="w-10 h-10" />
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-lg font-medium text-text-primary mb-1.5">
                    Drop files here, or click to browse
                  </p>
                  <p className="text-sm text-text-secondary">
                    TXT, MD, CSV, JSON · up to 50 files · processed in your browser
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono text-text-muted">
                  <span className="px-2 py-0.5 rounded border border-border">.txt</span>
                  <span className="px-2 py-0.5 rounded border border-border">.md</span>
                  <span className="px-2 py-0.5 rounded border border-border">.csv</span>
                  <span className="px-2 py-0.5 rounded border border-border">.json</span>
                </div>
              </motion.button>

              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="h-px flex-1 max-w-[80px] bg-border" />
                <button
                  type="button"
                  onClick={loadDemoFilesHandler}
                  disabled={isLoadingDemo}
                  className="text-xs text-text-secondary hover:text-accent transition-colors disabled:opacity-50 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/60"
                >
                  {isLoadingDemo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  )}
                  {isLoadingDemo
                    ? 'Loading demo transcripts…'
                    : 'Or load 5 sample transcripts'}
                </button>
                <div className="h-px flex-1 max-w-[80px] bg-border" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="files"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-subtle" />
                    <span className="text-sm font-medium text-text-primary">
                      {files.length} {files.length === 1 ? 'file' : 'files'} ready
                    </span>
                    <span className="text-xs font-mono text-text-muted">
                      {files.reduce(
                        (acc, f) => acc + parseFloat(f.size || '0'),
                        0,
                      ).toFixed(1)}{' '}
                      KB total
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="text-xs text-text-secondary hover:text-error transition-colors inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                </div>

                <ul className="divide-y divide-border">
                  {files.map((file, i) => (
                    <motion.li
                      key={file.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                      className="group px-6 py-4 flex items-center gap-4 hover:bg-surface-raised transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate font-mono">
                          {file.name}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5 font-mono">
                          {file.size} · ready
                        </p>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-success/10 text-success border border-success/20 font-mono">
                        <span className="w-1 h-1 rounded-full bg-success" />
                        READY
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-error/10 text-text-muted hover:text-error"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleZoneClick}
                  className="btn-ghost flex-1 sm:flex-initial"
                >
                  <Plus className="w-4 h-4" />
                  Add more files
                </button>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: files.length * 0.06 + 0.1, ease: [0.22, 1, 0.36, 1] }}
                  type="button"
                  onClick={handleStart}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary flex-1 !text-[15px] !py-4"
                >
                  <Sparkles className="w-4 h-4" />
                  Begin synthesis
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-text-muted mt-2">
                <ArrowUpRight className="w-3 h-3" />
                <span>
                  Next: Telescope reads every source and streams insights in real
                  time.
                </span>
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