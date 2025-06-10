'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon, UserIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/Providers'
import { getInitials } from '@/lib/utils'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showAuthButtons, setShowAuthButtons] = useState(false)

  const handleBack = () => {
    window.history.back()
  }

  const handleForward = () => {
    window.history.forward()
  }

  const handleLogin = () => {
    setShowAuthButtons(true)
    // Логика открытия модального окна входа будет в AuthModals
  }

  const handleRegister = () => {
    setShowAuthButtons(true)
    // Логика открытия модального окна регистрации будет в AuthModals
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-spotify-black/60 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Левая часть: кнопки навигации */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="w-8 h-8 rounded-full bg-spotify-light flex items-center justify-center text-spotify-gray hover:text-white transition-colors"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleForward}
              className="w-8 h-8 rounded-full bg-spotify-light flex items-center justify-center text-spotify-gray hover:text-white transition-colors"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Правая часть: меню пользователя */}
          <div className="relative">
            {isAuthenticated && user ? (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-full bg-spotify-light hover:bg-spotify-light/80 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-spotify-green flex items-center justify-center text-black font-bold text-sm">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <span className="text-white font-medium">{user.name}</span>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronLeftIcon className="w-4 h-4 text-spotify-gray rotate-90" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-spotify-light/90 backdrop-blur-md shadow-lg py-2 border border-white/10"
                    >
                      <a
                        href="/profile"
                        className="flex items-center px-4 py-2 text-spotify-gray hover:text-white hover:bg-spotify-light/80 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Профиль
                      </a>
                      <a
                        href="/settings"
                        className="flex items-center px-4 py-2 text-spotify-gray hover:text-white hover:bg-spotify-light/80 transition-colors"
                      >
                        <Cog6ToothIcon className="w-4 h-4 mr-2" />
                        Настройки
                      </a>
                      <div className="border-t border-spotify-light/30 my-2"></div>
                      <button
                        onClick={logout}
                        className="flex items-center w-full px-4 py-2 text-red-500 hover:text-red-400 hover:bg-spotify-light/80 transition-colors"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Выйти
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogin}
                  className="px-4 py-2 text-spotify-gray hover:text-white transition-colors"
                >
                  Войти
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRegister}
                  className="px-4 py-2 rounded-full bg-spotify-green text-black hover:bg-spotify-green/90 transition-colors font-medium"
                >
                  Регистрация
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}