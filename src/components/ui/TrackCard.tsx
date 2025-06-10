'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { PlayIcon } from '@heroicons/react/24/solid'
import { usePlayer } from '@/components/providers/Providers'
import { Track } from '@/types'

interface TrackCardProps {
  track: Track
}

export function TrackCard({ track }: TrackCardProps) {
  const { playTrack } = usePlayer()

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    playTrack(track)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="glass rounded-xl p-4 hover:bg-spotify-light/50 transition-all cursor-pointer group"
    >
      <div className="relative mb-4">
        <div className="aspect-square rounded-lg overflow-hidden">
          <Image
            src={track.thumbnail}
            alt={track.title}
            width={200}
            height={200}
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
      </div>
      <div>
        <h3 className="font-semibold text-white truncate mb-1">{track.title}</h3>
        <Link 
          href={`/artists/${track.artistId}`}
          className="text-spotify-gray text-sm hover:text-white transition-colors hover:underline"
        >
          {track.artist}
        </Link>
      </div>
    </motion.div>
  )
}