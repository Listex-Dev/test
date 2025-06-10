'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon, 
  BackwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  QueueListIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon
} from '@heroicons/react/24/solid'
import { usePlayer } from '@/components/providers/Providers'
import { formatTime } from '@/lib/utils'

export function Player() {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    currentIndex,
    shuffle,
    repeat,
    pauseTrack,
    resumeTrack,
    nextTrack,
    prevTrack,
    setVolume,
    seekTo,
    toggleShuffle,
    toggleRepeat
  } = usePlayer()

  const [showQueue, setShowQueue] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [volumeDragging, setVolumeDragging] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const volumeRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Обновление времени воспроизведения
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      const audio = audioRef.current
      
      const updateTime = () => {
        if (!isDragging) {
          seekTo(audio.currentTime)
        }
      }

      const updateDuration = () => {
        // Обновляем длительность трека
      }

      audio.addEventListener('timeupdate', updateTime)
      audio.addEventListener('loadedmetadata', updateDuration)
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime)
        audio.removeEventListener('loadedmetadata', updateDuration)
      }
    }
  }, [currentTrack, isDragging, seekTo])

  // Управление воспроизведением
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play()
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  // Обработка клика по прогресс-бару
  const handleProgressClick = (e: React.MouseEvent) => {
    if (progressRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      seekTo(newTime)
      if (audioRef.current) {
        audioRef.current.currentTime = newTime
      }
    }
  }

  // Обработка клика по регулятору громкости
  const handleVolumeClick = (e: React.MouseEvent) => {
    if (volumeRef.current) {
      const rect = volumeRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newVolume = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
      setVolume(newVolume)
      if (audioRef.current) {
        audioRef.current.volume = newVolume / 100
      }
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseTrack()
    } else {
      resumeTrack()
    }
  }

  const openEqualizer = () => {
    window.dispatchEvent(new CustomEvent('show-equalizer'))
  }

  const openLyrics = () => {
    window.dispatchEvent(new CustomEvent('show-lyrics'))
  }

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 glass-dark p-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-spotify-light flex items-center justify-center">
                <span className="text-spotify-gray text-xs">No track</span>
              </div>
              <div>
                <div className="font-semibold text-spotify-gray">Нет трека</div>
                <div className="text-spotify-gray text-sm">-</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <button className="text-spotify-gray cursor-not-allowed">
                  <BackwardIcon className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 rounded-full bg-spotify-light flex items-center justify-center cursor-not-allowed">
                  <PlayIcon className="w-5 h-5 text-spotify-gray ml-0.5" />
                </button>
                <button className="text-spotify-gray cursor-not-allowed">
                  <ForwardIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <button className="text-spotify-gray cursor-not-allowed">
                <SpeakerWaveIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Скрытый аудио элемент */}
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onEnded={nextTrack}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            // Устанавливаем громкость
            audioRef.current.volume = volume / 100
          }
        }}
      />

      {/* Очередь треков */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-24 right-4 w-96 glass-dark rounded-xl p-4 max-h-96 overflow-y-auto border border-white/10"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Очередь воспроизведения</h3>
              <button
                onClick={() => setShowQueue(false)}
                className="text-spotify-gray hover:text-white transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-2">
              {queue.map((track, index) => (
                <div
                  key={`${track.id}-${index}`}
                  className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                    index === currentIndex 
                      ? 'bg-spotify-green/20 border border-spotify-green/30' 
                      : 'hover:bg-spotify-light/30'
                  }`}
                >
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{track.title}</div>
                    <div className="text-spotify-gray text-sm truncate">{track.artist}</div>
                  </div>
                  {index === currentIndex && (
                    <div className="text-spotify-green">
                      <PlayIcon className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Основной плеер */}
      <div className="fixed bottom-0 left-0 right-0 glass-dark p-4 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Информация о треке */}
            <div className="flex items-center gap-4">
              <div className="relative w-14 h-14 rounded overflow-hidden">
                <Image
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{currentTrack.title}</div>
                <Link 
                  href={`/artists/${currentTrack.artistId}`}
                  className="text-spotify-gray text-sm hover:text-white hover:underline transition-colors truncate block"
                >
                  {currentTrack.artist}
                </Link>
              </div>
            </div>

            {/* Элементы управления */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleShuffle}
                  className={`transition-colors ${
                    shuffle ? 'text-spotify-green' : 'text-spotify-gray hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M15.5 4.5l-1.5 1.5L16.5 8.5H12c-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5h4.5v-2H12c-1.5 0-2.5-1-2.5-2.5s1-2.5 2.5-2.5h4.5l-2.5 2.5 1.5 1.5 5-5-5-5z"/>
                  </svg>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={prevTrack}
                  className="text-spotify-gray hover:text-white transition-colors"
                >
                  <BackwardIcon className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                  className="w-10 h-10 rounded-full bg-spotify-green flex items-center justify-center hover:bg-spotify-green/90 transition-colors"
                >
                  {isPlaying ? (
                    <PauseIcon className="w-5 h-5 text-black" />
                  ) : (
                    <PlayIcon className="w-5 h-5 text-black ml-0.5" />
                  )}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTrack}
                  className="text-spotify-gray hover:text-white transition-colors"
                >
                  <ForwardIcon className="w-5 h-5" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleRepeat}
                  className={`transition-colors ${
                    repeat !== 'none' ? 'text-spotify-green' : 'text-spotify-gray hover:text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 2v4l-2-2-2 2h4zm12 16v-4l2 2 2-2h-4zM2 8h12v4H2V8zm14-4v12H4V4h12z"/>
                  </svg>
                  {repeat === 'one' && (
                    <span className="absolute -top-1 -right-1 text-xs">1</span>
                  )}
                </motion.button>
              </div>
              
              {/* Прогресс-бар */}
              <div className="w-full flex items-center gap-2">
                <span className="text-xs text-spotify-gray min-w-[35px]">
                  {formatTime(currentTime)}
                </span>
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="flex-1 h-1 bg-spotify-gray/30 rounded-full cursor-pointer group"
                >
                  <div
                    className="h-full bg-spotify-green rounded-full relative group-hover:bg-spotify-green/80 transition-colors"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-spotify-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs text-spotify-gray min-w-[35px]">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            {/* Управление громкостью и дополнительные кнопки */}
            <div className="flex items-center justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openEqualizer}
                className="text-spotify-gray hover:text-white transition-colors"
              >
                <AdjustmentsHorizontalIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={openLyrics}
                className="text-spotify-gray hover:text-white transition-colors"
              >
                <DocumentTextIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowQueue(!showQueue)}
                className={`transition-colors ${
                  showQueue ? 'text-spotify-green' : 'text-spotify-gray hover:text-white'
                }`}
              >
                <QueueListIcon className="w-5 h-5" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setVolume(volume > 0 ? 0 : 100)}
                className="text-spotify-gray hover:text-white transition-colors"
              >
                {volume === 0 ? (
                  <SpeakerXMarkIcon className="w-5 h-5" />
                ) : (
                  <SpeakerWaveIcon className="w-5 h-5" />
                )}
              </motion.button>
              
              <div
                ref={volumeRef}
                onClick={handleVolumeClick}
                className="w-24 h-1 bg-spotify-gray/30 rounded-full cursor-pointer group"
              >
                <div
                  className="h-full bg-spotify-green rounded-full relative group-hover:bg-spotify-green/80 transition-colors"
                  style={{ width: `${volume}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-spotify-green rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}