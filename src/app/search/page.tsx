'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { TrackCard } from '@/components/ui/TrackCard'
import { ArtistCard } from '@/components/ui/ArtistCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Track, Artist } from '@/types'
import { api } from '@/lib/api'
import { debounce } from '@/lib/utils'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'artists'>('all')

  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setTracks([])
        setArtists([])
        return
      }

      setLoading(true)
      try {
        const results = await api.search(searchQuery)
        setTracks(results.tracks || [])
        setArtists(results.artists || [])
      } catch (error) {
        console.error('Ошибка поиска:', error)
      } finally {
        setLoading(false)
      }
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch])

  const tabs = [
    { id: 'all', label: 'Все' },
    { id: 'tracks', label: 'Треки' },
    { id: 'artists', label: 'Исполнители' },
  ]

  return (
    <div className="space-y-8">
      {/* Поисковая строка */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spotify-gray" />
          <input
            type="text"
            placeholder="Что хотите послушать?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-spotify-light/60 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors text-lg"
          />
        </div>
      </motion.div>

      {/* Вкладки */}
      {(tracks.length > 0 || artists.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-b border-spotify-light/30"
        >
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
              >
                <span className="relative">
                  {tab.label}
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-spotify-green transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                </span>
              </button>
            ))}
          </nav>
        </motion.div>
      )}

      {/* Результаты поиска */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Треки */}
          {(activeTab === 'all' || activeTab === 'tracks') && tracks.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-6">Треки</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {tracks.slice(0, activeTab === 'tracks' ? undefined : 10).map((track, index) => (
                  <motion.div
                    key={track.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <TrackCard track={track} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Исполнители */}
          {(activeTab === 'all' || activeTab === 'artists') && artists.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-xl font-bold mb-6">Исполнители</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {artists.slice(0, activeTab === 'artists' ? undefined : 10).map((artist, index) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <ArtistCard artist={artist} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Пустое состояние */}
          {!loading && query && tracks.length === 0 && artists.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <MagnifyingGlassIcon className="w-16 h-16 text-spotify-gray mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ничего не найдено</h3>
              <p className="text-spotify-gray">Попробуйте изменить поисковый запрос</p>
            </motion.div>
          )}
        </div>
      )}

      {/* Пустое пространство для плеера */}
      <div className="h-32"></div>
    </div>
  )
}