'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { TrackItem } from '@/components/ui/TrackItem'
import { AlbumCard } from '@/components/ui/AlbumCard'
import { ArtistCard } from '@/components/ui/ArtistCard'
import { VideoCard } from '@/components/ui/VideoCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { FollowButton } from '@/components/ui/FollowButton'
import { Artist, Track, Album, Video } from '@/types'
import { api } from '@/lib/api'

export default function ArtistPage() {
  const params = useParams()
  const artistId = params.id as string

  const [artist, setArtist] = useState<Artist | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [singles, setSingles] = useState<Album[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [relatedArtists, setRelatedArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<'tracks' | 'albums' | 'singles' | 'videos' | 'related'>('tracks')
  const [showAllTracks, setShowAllTracks] = useState(false)

  useEffect(() => {
    const loadArtist = async () => {
      try {
        const artistData = await api.getArtist(artistId)
        setArtist(artistData)
        setTracks(artistData.tracks || [])
        setAlbums(artistData.albums || [])
        setSingles(artistData.singles || [])
        setVideos(artistData.videos || [])
        setRelatedArtists(artistData.related || [])
      } catch (error) {
        console.error('Ошибка загрузки артиста:', error)
      } finally {
        setLoading(false)
      }
    }

    if (artistId) {
      loadArtist()
    }
  }, [artistId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    )
  }

  if (!artist) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">Артист не найден</h2>
        <p className="text-spotify-gray">Попробуйте найти другого исполнителя</p>
      </div>
    )
  }

  const sections = [
    { id: 'tracks', label: 'Треки' },
    { id: 'albums', label: 'Альбомы' },
    { id: 'singles', label: 'Синглы' },
    { id: 'videos', label: 'Видео' },
    { id: 'related', label: 'Похожие артисты' },
  ]

  const displayedTracks = showAllTracks ? tracks : tracks.slice(0, 10)

  return (
    <div className="space-y-8 pb-32">
      {/* Шапка артиста */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-96 rounded-xl overflow-hidden"
      >
        {/* Фоновое изображение */}
        <div className="absolute inset-0">
          <Image
            src={artist.image}
            alt={artist.name}
            fill
            className="object-cover blur-xl opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-spotify-black to-transparent"></div>
        </div>
        
        {/* Контент */}
        <div className="relative h-full flex items-end p-8">
          <div className="flex items-end gap-6">
            {/* Аватар артиста */}
            <div className="w-48 h-48 rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={artist.image}
                alt={artist.name}
                width={192}
                height={192}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Информация */}
            <div className="text-white">
              <h1 className="text-5xl font-bold mb-4">{artist.name}</h1>
              <p className="text-spotify-gray mb-2">
                <span>{tracks.length}</span> треков • <span>{artist.followers || 0}</span> подписчиков
              </p>
              {artist.description && (
                <p className="text-spotify-gray text-sm max-w-2xl mb-4">{artist.description}</p>
              )}
              <FollowButton artistId={artistId} artistName={artist.name} artistImage={artist.image} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Навигация по разделам */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-b border-spotify-light/30"
      >
        <nav className="flex gap-8 px-4">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={`nav-link ${activeSection === section.id ? 'active' : ''} group`}
            >
              <span className="relative">
                {section.label}
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-spotify-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Секции контента */}
      <div className="space-y-8">
        {/* Треки */}
        {activeSection === 'tracks' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Популярные треки</h2>
              {tracks.length > 10 && (
                <button
                  onClick={() => setShowAllTracks(!showAllTracks)}
                  className="text-spotify-gray hover:text-white transition-colors"
                >
                  {showAllTracks ? 'Скрыть' : 'Показать все'}
                </button>
              )}
            </div>
            <div className="space-y-2">
              {displayedTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TrackItem track={track} index={index + 1} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Альбомы */}
        {activeSection === 'albums' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Альбомы</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {albums.map((album, index) => (
                <motion.div
                  key={album.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AlbumCard album={album} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Синглы */}
        {activeSection === 'singles' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Синглы</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {singles.map((single, index) => (
                <motion.div
                  key={single.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <AlbumCard album={single} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Видео */}
        {activeSection === 'videos' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Видео</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <VideoCard video={video} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Похожие артисты */}
        {activeSection === 'related' && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Похожие артисты</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {relatedArtists.map((relatedArtist, index) => (
                <motion.div
                  key={relatedArtist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ArtistCard artist={relatedArtist} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  )
}