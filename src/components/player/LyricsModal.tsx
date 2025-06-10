'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { usePlayer } from '@/components/providers/Providers'

export function LyricsModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [lyrics, setLyrics] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { currentTrack } = usePlayer()

  useEffect(() => {
    const handleShow = () => {
      setIsVisible(true)
      if (currentTrack) {
        loadLyrics(currentTrack.id)
      }
    }
    
    window.addEventListener('show-lyrics', handleShow)
    return () => window.removeEventListener('show-lyrics', handleShow)
  }, [currentTrack])

  const loadLyrics = async (trackId: string) => {
    setLoading(true)
    try {
      // Здесь должен быть запрос к API для получения текста песни
      // Пока используем заглушку
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLyrics([
        'Текст песни будет загружен',
        'из внешнего API',
        '',
        'Пока что это заглушка',
        'для демонстрации интерфейса',
        '',
        'В реальном приложении',
        'здесь будет настоящий текст',
        'синхронизированный с музыкой'
      ])
    } catch (error) {
      console.error('Ошибка загрузки текста:', error)
      setLyrics(['Не удалось загрузить текст песни'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-spotify-black/95 backdrop-blur-md z-50"
        >
          {/* Кнопка закрытия */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setIsVisible(false)}
              className="text-spotify-gray hover:text-white text-2xl transition-colors"
            >
              <XMarkIcon className="w-8 h-8" />
            </button>
          </div>

          {/* Контент */}
          <div className="h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
            {currentTrack ? (
              <>
                {/* Информация о треке */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center mb-8"
                >
                  <h1 className="text-4xl font-bold mb-2">{currentTrack.title}</h1>
                  <p className="text-xl text-spotify-gray">{currentTrack.artist}</p>
                </motion.div>

                {/* Текст песни */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="max-w-2xl w-full text-center"
                >
                  {loading ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-spotify-green" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lyrics.map((line, index) => (
                        <motion.p
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`text-lg leading-relaxed ${
                            line.trim() === '' ? 'h-6' : 'text-white'
                          }`}
                        >
                          {line || '\u00A0'}
                        </motion.p>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <h2 className="text-2xl font-bold mb-4">Нет активного трека</h2>
                <p className="text-spotify-gray">Выберите трек для отображения текста</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}