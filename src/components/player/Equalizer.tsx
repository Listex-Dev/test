'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEqualizer } from '@/components/providers/Providers'

const presets = {
  flat: { name: 'Плоский', gains: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  bass: { name: 'Басы', gains: [8, 6, 4, 2, 0, -2, -4, -6, -8, -10] },
  treble: { name: 'Верха', gains: [-10, -8, -6, -4, -2, 0, 2, 4, 6, 8] },
  vocal: { name: 'Вокал', gains: [-2, -4, -4, 0, 2, 4, 4, 2, 0, -2] },
  rock: { name: 'Рок', gains: [4, 2, -2, -4, -2, 2, 4, 6, 6, 6] },
  pop: { name: 'Поп', gains: [-2, 2, 4, 4, 0, -2, -2, -2, -2, -2] },
  jazz: { name: 'Джаз', gains: [2, 0, 0, 2, -2, -2, 0, 2, 4, 6] },
  classic: { name: 'Классика', gains: [0, 0, 0, 0, 0, 0, -4, -4, -4, -6] },
  electronic: { name: 'Электроника', gains: [4, 2, 0, 0, -2, 2, 0, 2, 4, 6] },
  hiphop: { name: 'Хип-хоп', gains: [6, 4, 2, 2, -2, -2, 2, 2, 4, 4] },
}

export function Equalizer() {
  const [isVisible, setIsVisible] = useState(false)
  const {
    enabled,
    preset,
    bands,
    preamp,
    toggleEqualizer,
    setPreset,
    setBandGain,
    setPreamp,
  } = useEqualizer()

  useEffect(() => {
    const handleShow = () => setIsVisible(true)
    window.addEventListener('show-equalizer', handleShow)
    return () => window.removeEventListener('show-equalizer', handleShow)
  }, [])

  const handlePresetChange = (presetName: string) => {
    setPreset(presetName)
    if (presets[presetName as keyof typeof presets]) {
      const presetData = presets[presetName as keyof typeof presets]
      presetData.gains.forEach((gain, index) => {
        setBandGain(index, gain)
      })
    }
  }

  const handleBandChange = (index: number, value: number) => {
    setBandGain(index, value)
    setPreset('custom')
  }

  const resetEqualizer = () => {
    handlePresetChange('flat')
    setPreamp(0)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsVisible(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-spotify-dark rounded-lg p-8 w-[900px] max-h-[90vh] overflow-y-auto relative"
          >
            {/* Заголовок */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-white">Эквалайзер</h2>
                <button
                  onClick={toggleEqualizer}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    enabled
                      ? 'bg-spotify-green text-black hover:bg-spotify-green/80'
                      : 'bg-spotify-light text-white hover:bg-spotify-light/80'
                  }`}
                >
                  {enabled ? 'Включен' : 'Выключен'}
                </button>
              </div>
              <button
                onClick={() => setIsVisible(false)}
                className="text-spotify-gray hover:text-white transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Пресеты */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Пресеты</h3>
              <div className="grid grid-cols-3 gap-4">
                <select
                  value={preset}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="col-span-2 bg-spotify-light text-white rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-spotify-green"
                >
                  <optgroup label="Базовые">
                    <option value="flat">Плоский</option>
                    <option value="bass">Басы</option>
                    <option value="treble">Верха</option>
                    <option value="vocal">Вокал</option>
                  </optgroup>
                  <optgroup label="Музыкальные жанры">
                    <option value="rock">Рок</option>
                    <option value="pop">Поп</option>
                    <option value="jazz">Джаз</option>
                    <option value="classic">Классика</option>
                    <option value="electronic">Электроника</option>
                    <option value="hiphop">Хип-хоп</option>
                  </optgroup>
                  <optgroup label="Пользовательские">
                    <option value="custom">Пользовательский</option>
                  </optgroup>
                </select>
                <button
                  onClick={resetEqualizer}
                  className="px-6 py-3 bg-spotify-light text-white rounded-lg hover:bg-spotify-light/80 transition-colors text-lg"
                >
                  Сбросить
                </button>
              </div>
            </div>

            {/* Ползунки эквалайзера */}
            <div className="glass-dark rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Частоты</h3>
              <div className="flex items-end justify-between gap-4 h-80">
                {bands.map((band, index) => (
                  <div key={index} className="flex flex-col items-center gap-3">
                    <div className="text-spotify-green text-sm font-medium">
                      {band.gain > 0 ? '+' : ''}{band.gain.toFixed(1)} dB
                    </div>
                    <div className="relative w-12 h-64 bg-spotify-light/30 rounded-lg overflow-hidden">
                      {/* Деления шкалы */}
                      <div className="absolute inset-0 flex flex-col justify-between px-2 pointer-events-none">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="h-px bg-spotify-light/30" />
                        ))}
                      </div>
                      
                      {/* Ползунок */}
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="0.1"
                        value={band.gain}
                        onChange={(e) => handleBandChange(index, parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer slider-vertical"
                        style={{
                          writingMode: 'bt-lr',
                          WebkitAppearance: 'slider-vertical',
                        }}
                      />
                      
                      {/* Индикатор значения */}
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-spotify-green/20 transition-all duration-100 pointer-events-none"
                        style={{
                          height: `${((band.gain + 12) / 24) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-spotify-gray text-sm font-medium">
                      {band.frequency < 1000 
                        ? `${band.frequency}Hz` 
                        : `${(band.frequency / 1000).toFixed(1)}kHz`
                      }
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Дополнительные настройки */}
            <div className="grid grid-cols-2 gap-6">
              <div className="glass-dark rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Предусиление</h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="12"
                    step="0.1"
                    value={preamp}
                    onChange={(e) => setPreamp(parseFloat(e.target.value))}
                    className="flex-1 h-2 appearance-none bg-spotify-light/30 rounded-full cursor-pointer slider-horizontal"
                  />
                  <span className="text-spotify-green text-sm font-medium w-16 text-right">
                    +{preamp.toFixed(1)} dB
                  </span>
                </div>
              </div>
              
              <div className="glass-dark rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Статус</h3>
                <div className="text-spotify-gray">
                  <div>Пресет: {presets[preset as keyof typeof presets]?.name || 'Пользовательский'}</div>
                  <div>Состояние: {enabled ? 'Активен' : 'Неактивен'}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}