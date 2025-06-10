'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useAuth } from '@/components/providers/Providers'
import toast from 'react-hot-toast'

export function AuthModals() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  
  const { login, register } = useAuth()

  // Глобальные обработчики для открытия модалок
  useEffect(() => {
    const handleShowLogin = () => setShowLogin(true)
    const handleShowRegister = () => setShowRegister(true)
    
    window.addEventListener('show-login', handleShowLogin)
    window.addEventListener('show-register', handleShowRegister)
    
    return () => {
      window.removeEventListener('show-login', handleShowLogin)
      window.removeEventListener('show-register', handleShowRegister)
    }
  }, [])

  const closeModals = () => {
    setShowLogin(false)
    setShowRegister(false)
    setErrors({})
    setLoginData({ email: '', password: '' })
    setRegisterData({ name: '', email: '', password: '', confirmPassword: '' })
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      await login(loginData.email, loginData.password)
      toast.success('Добро пожаловать!')
      closeModals()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка входа'
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Валидация
    if (registerData.password !== registerData.confirmPassword) {
      setErrors({ confirmPassword: 'Пароли не совпадают' })
      setLoading(false)
      return
    }

    if (registerData.password.length < 6) {
      setErrors({ password: 'Пароль должен содержать минимум 6 символов' })
      setLoading(false)
      return
    }

    try {
      await register(registerData.name, registerData.email, registerData.password)
      toast.success('Регистрация успешна!')
      closeModals()
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Ошибка регистрации'
      setErrors({ general: errorMessage })
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const switchToRegister = () => {
    setShowLogin(false)
    setShowRegister(true)
    setErrors({})
  }

  const switchToLogin = () => {
    setShowRegister(false)
    setShowLogin(true)
    setErrors({})
  }

  return (
    <>
      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModals}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md p-6 glass rounded-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Вход</h2>
                <button
                  onClick={closeModals}
                  className="text-spotify-gray hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-spotify-gray mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-spotify-light/60 border border-white/20 text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spotify-gray mb-2">
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-spotify-light/60 border border-white/20 text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-spotify-green text-black font-medium hover:bg-spotify-green/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Вход...' : 'Войти'}
                </button>
              </form>

              <div className="mt-6 text-center text-spotify-gray">
                Нет аккаунта?{' '}
                <button
                  onClick={switchToRegister}
                  className="text-spotify-green hover:text-spotify-green/90 transition-colors"
                >
                  Зарегистрироваться
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <AnimatePresence>
        {showRegister && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModals}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md p-6 glass rounded-xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Регистрация</h2>
                <button
                  onClick={closeModals}
                  className="text-spotify-gray hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-spotify-gray mb-2">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-spotify-light/60 border border-white/20 text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spotify-gray mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-spotify-light/60 border border-white/20 text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spotify-gray mb-2">
                    Пароль
                  </label>
                  <input
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-spotify-light/60 border border-white/20 text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors"
                    required
                  />
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-spotify-gray mb-2">
                    Подтвердите пароль
                  </label>
                  <input
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-spotify-light/60 border border-white/20 text-white placeholder-spotify-gray focus:outline-none focus:border-spotify-green transition-colors"
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-full bg-spotify-green text-black font-medium hover:bg-spotify-green/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
              </form>

              <div className="mt-6 text-center text-spotify-gray">
                Уже есть аккаунт?{' '}
                <button
                  onClick={switchToLogin}
                  className="text-spotify-green hover:text-spotify-green/90 transition-colors"
                >
                  Войти
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}