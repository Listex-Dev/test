'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  PlayIcon, 
  PlusIcon, 
  ForwardIcon,
  HeartIcon,
  ShareIcon,
  QueueListIcon
} from '@heroicons/react/24/outline'
import { usePlayer } from '@/components/providers/Providers'

interface ContextMenuProps {
  x?: number
  y?: number
  track?: any
  onClose?: () => void
}

export function ContextMenu() {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [selectedTrack, setSelectedTrack] = useState<any>(null)
  const { playTrack, addToQueue } = usePlayer()

  useEffect(() => {
    const handleContextMenu = (e: CustomEvent) => {
      const { x, y, track } = e.detail
      setPosition({ x, y })
      setSelectedTrack(track)
      setIsVisible(true)
    }

    const handleClick = () => {
      setIsVisible(false)
    }

    window.addEventListener('show-context-menu' as any, handleContextMenu)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('show-context-menu' as any, handleContextMenu)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  const handleAction = (action: string) => {
    if (!selectedTrack) return

    switch (action) {
      case 'play':
        playTrack(selectedTrack)
        break
      case 'add-to-queue':
        addToQueue(selectedTrack)
        break
      case 'play-next':
        // Логика воспроизведения следующим
        break
      case 'like':
        // Логика добавления в избранное
        break
      case 'share':
        // Логика поделиться
        break
    }
    
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 1000,
          }}
          className="glass-dark rounded-xl p-2 shadow-lg border border-white/10 min-w-[200px]"
        >
          <button
            onClick={() => handleAction('play')}
            className="w-full px-4 py-2 text-left hover:bg-spotify-light/50 rounded-lg transition-colors flex items-center gap-3"
          >
            <PlayIcon className="w-4 h-4 text-spotify-gray" />
            <span>Воспроизвести</span>
          </button>
          
          <button
            onClick={() => handleAction('add-to-queue')}
            className="w-full px-4 py-2 text-left hover:bg-spotify-light/50 rounded-lg transition-colors flex items-center gap-3"
          >
            <QueueListIcon className="w-4 h-4 text-spotify-gray" />
            <span>Добавить в очередь</span>
          </button>
          
          <button
            onClick={() => handleAction('play-next')}
            className="w-full px-4 py-2 text-left hover:bg-spotify-light/50 rounded-lg transition-colors flex items-center gap-3"
          >
            <ForwardIcon className="w-4 h-4 text-spotify-gray" />
            <span>Воспроизвести следующим</span>
          </button>
          
          <div className="border-t border-spotify-light/30 my-2" />
          
          <button
            onClick={() => handleAction('like')}
            className="w-full px-4 py-2 text-left hover:bg-spotify-light/50 rounded-lg transition-colors flex items-center gap-3"
          >
            <HeartIcon className="w-4 h-4 text-spotify-gray" />
            <span>Добавить в избранное</span>
          </button>
          
          <button
            onClick={() => handleAction('share')}
            className="w-full px-4 py-2 text-left hover:bg-spotify-light/50 rounded-lg transition-colors flex items-center gap-3"
          >
            <ShareIcon className="w-4 h-4 text-spotify-gray" />
            <span>Поделиться</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}