'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { PlayIcon } from '@heroicons/react/24/solid'
import { usePlayer } from '@/components/providers/Providers'
import { Video } from '@/types'

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
  const { playTrack } = usePlayer()

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Конвертируем видео в трек для воспроизведения
    const track = {
      id: video.id,
      title: video.title,
      artist: 'YouTube',
      artistId: 'youtube',
      thumbnail: video.thumbnail,
      duration: video.duration,
      url: `https://www.youtube.com/watch?v=${video.id}`
    }
    playTrack(track)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-xl p-4 hover:bg-spotify-light/50 transition-all cursor-pointer group"
    >
      <div className="relative mb-4">
        <div className="aspect-video rounded-lg overflow-hidden">
          <Image
            src={video.thumbnail}
            alt={video.title}
            width={320}
            height={180}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ 
            opacity: 1,
            scale: 1,
          }}
          onClick={handlePlay}
          className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <PlayIcon className="w-5 h-5 text-black ml-0.5" />
        </motion.button>
        
        {/* Длительность видео */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-white truncate mb-1">{video.title}</h3>
        <p className="text-spotify-gray text-sm">{video.views} просмотров</p>
      </div>
    </motion.div>
  )
}