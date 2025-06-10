'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { PlayIcon, PauseIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import { usePlayer } from '@/components/providers/Providers'
import { Track } from '@/types'
import { useState } from 'react'

interface TrackItemProps {
  track: Track
  index: number
  showArtist?: boolean
}

export function TrackItem({ track, index, showArtist = true }: TrackItemProps) {
  const { currentTrack, isPlaying, playTrack, pauseTrack, resumeTrack } = usePlayer()
  const [showMenu, setShowMenu] = useState(false)
  
  const isCurrentTrack = currentTrack?.id === track.id
  const isCurrentlyPlaying = isCurrentTrack && isPlaying

  const handlePlay = () => {
    if (isCurrentTrack) {
      if (isPlaying) {
        pauseTrack()
      } else {
        resumeTrack()
      }
    } else {
      playTrack(track)
    }
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setShowMenu(true)
    // Здесь можно добавить логику контекстного меню
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group flex items-center gap-4 p-3 rounded-lg hover:bg-spotify-light/30 transition-all cursor-pointer ${
        isCurrentTrack ? 'bg-spotify-light/20' : ''
      }`}
      onClick={handlePlay}
      onContextMenu={handleContextMenu}
    >
      {/* Номер трека / кнопка воспроизведения */}
      <div className="w-6 flex items-center justify-center">
        {isCurrentlyPlaying ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-spotify-green"
          >
            <PauseIcon className="w-4 h-4" />
          </motion.div>
        ) : isCurrentTrack ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-spotify-green"
          >
            <PlayIcon className="w-4 h-4" />
          </motion.div>
        ) : (
          <>
            <span className="text-spotify-gray text-sm group-hover:hidden">
              {index}
            </span>
            <PlayIcon className="w-4 h-4 text-white hidden group-hover:block" />
          </>
        )}
      </div>

      {/* Обложка и информация о треке */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
          <Image
            src={track.thumbnail}
            alt={track.title}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className={`font-medium truncate ${isCurrentTrack ? 'text-spotify-green' : 'text-white'}`}>
            {track.title}
          </div>
          {showArtist && (
            <Link 
              href={`/artists/${track.artistId}`}
              className="text-spotify-gray text-sm hover:text-white hover:underline transition-colors truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {track.artist}
            </Link>
          )}
        </div>
      </div>

      {/* Длительность */}
      <div className="text-spotify-gray text-sm">
        {track.duration}
      </div>

      {/* Кнопка меню */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setShowMenu(!showMenu)
        }}
        className="opacity-0 group-hover:opacity-100 text-spotify-gray hover:text-white transition-all p-1"
      >
        <EllipsisHorizontalIcon className="w-5 h-5" />
      </button>
    </motion.div>
  )
}