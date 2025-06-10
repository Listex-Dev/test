export interface Track {
  id: string
  title: string
  artist: string
  artistId: string
  thumbnail: string
  duration: string
  url?: string
}

export interface Artist {
  id: string
  name: string
  image: string
  description?: string
  followers?: number
  tracks?: Track[]
  albums?: Album[]
  singles?: Album[]
  videos?: Video[]
  related?: Artist[]
}

export interface Album {
  id: string
  title: string
  artist: string
  artistId: string
  thumbnail: string
  year: string
  tracks?: Track[]
}

export interface Video {
  id: string
  title: string
  thumbnail: string
  views: string
  duration: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

export interface PlayerState {
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  currentTime: number
  duration: number
  queue: Track[]
  currentIndex: number
  shuffle: boolean
  repeat: 'none' | 'one' | 'all'
}

export interface EqualizerBand {
  frequency: number
  gain: number
}

export interface EqualizerState {
  enabled: boolean
  preset: string
  bands: EqualizerBand[]
  preamp: number
}