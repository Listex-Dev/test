'use client'

import { useEffect, useState } from 'react'
import { TrackCard } from '@/components/ui/TrackCard'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { motion } from 'framer-motion'
import { Track } from '@/types'
import { api } from '@/lib/api'

export default function HomePage() {
  const [popularTracks, setPopularTracks] = useState<Track[]>([])
  const [newReleases, setNewReleases] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [popular, releases] = await Promise.all([
          api.getPopularTracks(),
          api.getNewReleases()
        ])
        setPopularTracks(popular)
        setNewReleases(releases)
      } catch (error) {
        console.error('Ошибка загрузки данных:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Заголовок */}
      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-6"
      >
        <h2 className="text-2xl font-bold">Добро пожаловать в ReMusic</h2>
      </motion.header>

      {/* Популярные треки */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-spotify-green rounded-full"></span>
          Популярные треки
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {popularTracks.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <TrackCard track={track} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Новые релизы */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-spotify-green rounded-full"></span>
          Новые релизы
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {newReleases.map((track, index) => (
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

      {/* Пустое пространство для плеера */}
      <div className="h-32"></div>
    </div>
  )
}