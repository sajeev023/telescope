// Shared demo transcript catalogue. Used by the hero "Run live demo" CTA
// and by the upload page "load sample transcripts" button so the two
// entry points stay in sync.

export type DemoFile = {
  name: string
  path: string
}

export const DEMO_FILES: DemoFile[] = [
  { name: 'interview-smb-1.txt', path: '/demo/interview-smb-1.txt' },
  { name: 'interview-smb-2.txt', path: '/demo/interview-smb-2.txt' },
  { name: 'interview-enterprise-1.txt', path: '/demo/interview-enterprise-1.txt' },
  { name: 'interview-enterprise-2.txt', path: '/demo/interview-enterprise-2.txt' },
  { name: 'interview-freelancer.txt', path: '/demo/interview-freelancer.txt' },
]

export type LoadedFile = {
  id: string
  name: string
  size: string
  content: string
}

/**
 * Fetch every demo transcript, returning LoadedFile[] ready to push into
 * sessionStorage and the upload page state.
 */
export async function loadDemoFiles(): Promise<LoadedFile[]> {
  const results: LoadedFile[] = []
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
  return results
}

/**
 * Read a user-selected FileList, converting each file into a LoadedFile
 * with its text content and a human-readable size string.
 */
const MAX_FILE_BYTES = 50 * 1024 * 1024 // 50 MB per-file cap

export async function readRealFiles(fileList: FileList | File[]): Promise<LoadedFile[]> {
  const out: LoadedFile[] = []
  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]
    let textContent = ''
    if (file.size > MAX_FILE_BYTES) {
      textContent = `[File too large to preview: ${(file.size / 1024 / 1024).toFixed(1)} MB. Max is 50 MB.]`
    } else {
      try {
        textContent = await file.text()
      } catch (err) {
        console.error('Failed to read file:', file.name, err)
      }
    }
    const formattedSize =
      file.size < 1024 ? `${file.size} B` : `${(file.size / 1024).toFixed(1)} KB`
    out.push({
      id: `${file.name}-${i}-${Date.now()}`,
      name: file.name,
      size: formattedSize,
      content: textContent,
    })
  }
  return out
}