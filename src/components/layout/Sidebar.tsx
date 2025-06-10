'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/Providers'
import { apiService } from '@/lib/api'
import { Artist } from '@/types'

export function Sidebar() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()
  const [followedArtists, setFollowedArtists] = useState<Artist[]>([])

  useEffect(() => {
    if (isAuthenticated) {
      loadFollowedArtists()
    }
  }, [isAuthenticated])

  const loadFollowedArtists = async () => {
    try {
      const response = await apiService.getFollowedArtists()
      setFollowedArtists(response.artists || [])
    } catch (error) {
      console.error('Ошибка загрузки подписок:', error)
    }
  }

  const navItems = [
    { href: '/', label: 'Главная', icon: HomeIcon },
    { href: '/search', label: 'Поиск', icon: MagnifyingGlassIcon },
  ]

  return (
    <aside className="w-64 bg-spotify-black glass-dark fixed h-full z-40">
      <div className="p-6">
        <Link href="/">
          <motion.h1 
            whileHover={{ scale: 1.02 }}
            className="text-2xl font-bold text-spotify-green cursor-pointer"
          >
            ReMusic
          </motion.h1>
        </Link>
      </div>
      
      <nav className="px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition-all duration-300 cursor-pointer ${
                  isActive 
                    ? 'bg-spotify-light text-white' 
                    : 'text-spotify-gray hover:bg-spotify-light hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}

        {/* Подписки на исполнителей */}
        {isAuthenticated && followedArtists.length > 0 && (
          <div className="mt-8">
            <div className="px-4 mb-2">
              <h2 className="text-spotify-gray text-sm font-semibold uppercase tracking-wider">
                Подписки
              </h2>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-hide">
              {followedArtists.map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.id}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-spotify-gray hover:bg-spotify-light hover:text-white transition-all duration-300 cursor-pointer"
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-sm truncate">{artist.name}</span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </aside>
  )
}