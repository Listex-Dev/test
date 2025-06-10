'use client'

import { motion } from 'framer-motion'

export function LoadingSpinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="w-12 h-12 border-4 border-spotify-light border-t-spotify-green rounded-full"
    />
  )
}