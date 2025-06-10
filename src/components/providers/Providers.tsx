'use client'

import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthState, PlayerState, EqualizerState, Track, User } from '@/types'
import { apiService } from '@/lib/api'

// Auth Context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Player Context
interface PlayerContextType extends PlayerState {
  playTrack: (track: Track) => void
  pauseTrack: () => void
  resumeTrack: () => void
  nextTrack: () => void
  prevTrack: () => void
  setVolume: (volume: number) => void
  seekTo: (time: number) => void
  addToQueue: (track: Track) => void
  removeFromQueue: (index: number) => void
  toggleShuffle: () => void
  toggleRepeat: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

// Equalizer Context
interface EqualizerContextType extends EqualizerState {
  toggleEqualizer: () => void
  setPreset: (preset: string) => void
  setBandGain: (index: number, gain: number) => void
  setPreamp: (preamp: number) => void
}

const EqualizerContext = createContext<EqualizerContextType | undefined>(undefined)

// Reducers
function authReducer(state: AuthState, action: any): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false }
    case 'LOGOUT':
      return { user: null, isAuthenticated: false, loading: false }
    default:
      return state
  }
}

function playerReducer(state: PlayerState, action: any): PlayerState {
  switch (action.type) {
    case 'SET_CURRENT_TRACK':
      return { ...state, currentTrack: action.payload }
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload }
    case 'SET_VOLUME':
      return { ...state, volume: action.payload }
    case 'SET_TIME':
      return { ...state, currentTime: action.payload }
    case 'SET_DURATION':
      return { ...state, duration: action.payload }
    case 'SET_QUEUE':
      return { ...state, queue: action.payload }
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload }
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle }
    case 'TOGGLE_REPEAT':
      const repeatModes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all']
      const currentIndex = repeatModes.indexOf(state.repeat)
      const nextIndex = (currentIndex + 1) % repeatModes.length
      return { ...state, repeat: repeatModes[nextIndex] }
    default:
      return state
  }
}

function equalizerReducer(state: EqualizerState, action: any): EqualizerState {
  switch (action.type) {
    case 'TOGGLE_ENABLED':
      return { ...state, enabled: !state.enabled }
    case 'SET_PRESET':
      return { ...state, preset: action.payload }
    case 'SET_BAND_GAIN':
      const newBands = [...state.bands]
      newBands[action.index] = { ...newBands[action.index], gain: action.gain }
      return { ...state, bands: newBands }
    case 'SET_PREAMP':
      return { ...state, preamp: action.payload }
    default:
      return state
  }
}

// Initial states
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
}

const initialPlayerState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 100,
  currentTime: 0,
  duration: 0,
  queue: [],
  currentIndex: 0,
  shuffle: false,
  repeat: 'none',
}

const initialEqualizerState: EqualizerState = {
  enabled: false,
  preset: 'flat',
  bands: [
    { frequency: 60, gain: 0 },
    { frequency: 170, gain: 0 },
    { frequency: 310, gain: 0 },
    { frequency: 600, gain: 0 },
    { frequency: 1000, gain: 0 },
    { frequency: 3000, gain: 0 },
    { frequency: 6000, gain: 0 },
    { frequency: 12000, gain: 0 },
    { frequency: 14000, gain: 0 },
    { frequency: 16000, gain: 0 },
  ],
  preamp: 0,
}

export function Providers({ children }: { children: ReactNode }) {
  const [authState, authDispatch] = useReducer(authReducer, initialAuthState)
  const [playerState, playerDispatch] = useReducer(playerReducer, initialPlayerState)
  const [equalizerState, equalizerDispatch] = useReducer(equalizerReducer, initialEqualizerState)

  // Auth functions
  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
      authDispatch({ type: 'SET_USER', payload: response.user })
    } catch (error) {
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await apiService.register(name, email, password)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
      authDispatch({ type: 'SET_USER', payload: response.user })
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    authDispatch({ type: 'LOGOUT' })
  }

  // Player functions
  const playTrack = (track: Track) => {
    playerDispatch({ type: 'SET_CURRENT_TRACK', payload: track })
    playerDispatch({ type: 'SET_PLAYING', payload: true })
  }

  const pauseTrack = () => {
    playerDispatch({ type: 'SET_PLAYING', payload: false })
  }

  const resumeTrack = () => {
    playerDispatch({ type: 'SET_PLAYING', payload: true })
  }

  const nextTrack = () => {
    const nextIndex = (playerState.currentIndex + 1) % playerState.queue.length
    if (playerState.queue[nextIndex]) {
      playerDispatch({ type: 'SET_CURRENT_INDEX', payload: nextIndex })
      playerDispatch({ type: 'SET_CURRENT_TRACK', payload: playerState.queue[nextIndex] })
    }
  }

  const prevTrack = () => {
    const prevIndex = playerState.currentIndex === 0 ? playerState.queue.length - 1 : playerState.currentIndex - 1
    if (playerState.queue[prevIndex]) {
      playerDispatch({ type: 'SET_CURRENT_INDEX', payload: prevIndex })
      playerDispatch({ type: 'SET_CURRENT_TRACK', payload: playerState.queue[prevIndex] })
    }
  }

  const setVolume = (volume: number) => {
    playerDispatch({ type: 'SET_VOLUME', payload: volume })
  }

  const seekTo = (time: number) => {
    playerDispatch({ type: 'SET_TIME', payload: time })
  }

  const addToQueue = (track: Track) => {
    const newQueue = [...playerState.queue, track]
    playerDispatch({ type: 'SET_QUEUE', payload: newQueue })
  }

  const removeFromQueue = (index: number) => {
    const newQueue = playerState.queue.filter((_, i) => i !== index)
    playerDispatch({ type: 'SET_QUEUE', payload: newQueue })
  }

  const toggleShuffle = () => {
    playerDispatch({ type: 'TOGGLE_SHUFFLE' })
  }

  const toggleRepeat = () => {
    playerDispatch({ type: 'TOGGLE_REPEAT' })
  }

  // Equalizer functions
  const toggleEqualizer = () => {
    equalizerDispatch({ type: 'TOGGLE_ENABLED' })
  }

  const setPreset = (preset: string) => {
    equalizerDispatch({ type: 'SET_PRESET', payload: preset })
  }

  const setBandGain = (index: number, gain: number) => {
    equalizerDispatch({ type: 'SET_BAND_GAIN', index, gain })
  }

  const setPreamp = (preamp: number) => {
    equalizerDispatch({ type: 'SET_PREAMP', payload: preamp })
  }

  // Check auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const user = await apiService.getProfile()
          authDispatch({ type: 'SET_USER', payload: user })
        } catch (error) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          authDispatch({ type: 'SET_USER', payload: null })
        }
      } else {
        authDispatch({ type: 'SET_USER', payload: null })
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout }}>
      <PlayerContext.Provider value={{
        ...playerState,
        playTrack,
        pauseTrack,
        resumeTrack,
        nextTrack,
        prevTrack,
        setVolume,
        seekTo,
        addToQueue,
        removeFromQueue,
        toggleShuffle,
        toggleRepeat,
      }}>
        <EqualizerContext.Provider value={{
          ...equalizerState,
          toggleEqualizer,
          setPreset,
          setBandGain,
          setPreamp,
        }}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#282828',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              },
            }}
          />
        </EqualizerContext.Provider>
      </PlayerContext.Provider>
    </AuthContext.Provider>
  )
}

// Hooks
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function usePlayer() {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}

export function useEqualizer() {
  const context = useContext(EqualizerContext)
  if (context === undefined) {
    throw new Error('useEqualizer must be used within an EqualizerProvider')
  }
  return context
}