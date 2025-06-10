'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/Providers'
import { apiService } from '@/lib/api'
import toast from 'react-hot-toast'

interface FollowButtonProps {
  artistId: string
  artistName: string
  artistImage: string
}

export function FollowButton({ artistId, artistName, artistImage }: FollowButtonProps) {
  const { isAuthenticated } = useAuth()
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      checkFollowStatus()
    }
  }, [isAuthenticated, artistId])

  const checkFollowStatus = async () => {
    try {
      const response = await apiService.getFollowedArtists()
      const following = response.artists.some((artist: any) => artist.artist_id === artistId)
      setIsFollowing(following)
    } catch (error) {
      console.error('Ошибка проверки подписки:', error)
    }
  }

  const handleFollow = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('show-login'))
      return
    }

    setLoading(true)
    try {
      if (isFollowing) {
        await apiService.unfollowArtist(artistId)
        setIsFollowing(false)
        toast.success('Вы отписались от исполнителя')
      } else {
        await apiService.followArtist(artistId, artistName, artistImage)
        setIsFollowing(true)
        toast.success('Вы подписались на исполнителя')
      }
    } catch (error) {
      console.error('Ошибка при изменении подписки:', error)
      toast.error('Произошла ошибка')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleFollow}
        className="px-6 py-2 rounded-full bg-spotify-green text-black font-semibold hover:bg-spotify-green/90 transition-colors"
      >
        Подписаться
      </motion.button>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleFollow}
      disabled={loading}
      className={`px-6 py-2 rounded-full font-semibold transition-colors disabled:opacity-50 ${
        isFollowing
          ? 'border border-spotify-gray text-white hover:bg-spotify-light/20'
          : 'bg-spotify-green text-black hover:bg-spotify-green/90'
      }`}
    >
      {loading ? '...' : isFollowing ? 'Отписаться' : 'Подписаться'}
    </motion.button>
  )
}