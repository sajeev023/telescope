'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Check } from 'lucide-react'

export function ExportButton() {
  const [clicked, setClicked] = useState(false)

  const handleExport = () => {
    setClicked(true)
    window.print()
    setTimeout(() => setClicked(false), 2000)
  }

  return (
    <motion.button
      type="button"
      onClick={handleExport}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="btn-ghost !py-2.5"
    >
      {clicked ? (
        <>
          <Check className="w-4 h-4 text-success" />
          Opening print dialog…
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export PDF
        </>
      )}
    </motion.button>
  )
}