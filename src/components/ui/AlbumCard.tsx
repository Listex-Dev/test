'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { PlayIcon } from '@heroicons/react/24/solid'
import { Album } from '@/types'

interface AlbumCardProps {
  album: Album
}

export function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/albums/${album.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className="glass rounded-xl p-4 hover:bg-spotify-light/50 transition-all cursor-pointer group"
      >
        <div className="relative mb-4">
          <div className="aspect-square rounded-lg overflow-hidden">
            <Image
              src={album.thumbnail}
              alt={album.title}
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
            className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <PlayIcon className="w-5 h-5 text-black ml-0.5" />
          </motion.button>
        </div>
        <div>
          <h3 className="font-semibold text-white truncate mb-1">{album.title}</h3>
          <p className="text-spotify-gray text-sm truncate">{album.year} • {album.artist}</p>
        </div>
      </motion.div>
    </Link>
  )
}