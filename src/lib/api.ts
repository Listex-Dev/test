import axios from 'axios'
import { Track, Artist, Album, Video, User } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Добавляем токен авторизации к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Обработка ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const apiService = {
  // Треки
  async getPopularTracks(): Promise<Track[]> {
    const response = await api.get('/popular')
    return response.data
  },

  async getNewReleases(): Promise<Track[]> {
    const response = await api.get('/new-releases')
    return response.data
  },

  async getTrack(id: string): Promise<Track> {
    const response = await api.get(`/tracks/${id}`)
    return response.data
  },

  // Поиск
  async search(query: string): Promise<{ tracks: Track[]; artists: Artist[] }> {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`)
    return response.data
  },

  // Исполнители
  async getArtist(id: string): Promise<Artist> {
    const response = await api.get(`/artists/${id}`)
    return response.data
  },

  async followArtist(artistId: string, artistName: string, image: string): Promise<void> {
    await api.post('/user/followed-artists', {
      artist_id: artistId,
      artist_name: artistName,
      image,
    })
  },

  async unfollowArtist(artistId: string): Promise<void> {
    await api.delete(`/user/followed-artists/${artistId}`)
  },

  async getFollowedArtists(): Promise<{ artists: any[] }> {
    const response = await api.get('/user/followed-artists')
    return response.data
  },

  async getArtistFollowers(artistId: string): Promise<{ followers_count: number }> {
    const response = await api.get(`/user/followed-artists/${artistId}/followers`)
    return response.data
  },

  // Альбомы
  async getAlbum(id: string): Promise<Album> {
    const response = await api.get(`/albums/${id}`)
    return response.data
  },

  async getSingle(id: string): Promise<Album> {
    const response = await api.get(`/singles/${id}`)
    return response.data
  },

  // Авторизация
  async login(email: string, password: string): Promise<{ access_token: string; refresh_token: string; user: User }> {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(name: string, email: string, password: string): Promise<{ access_token: string; refresh_token: string; user: User }> {
    const response = await api.post('/auth/register', { name, email, password })
    return response.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token')
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },

  // Пользователь
  async getProfile(): Promise<User> {
    const response = await api.get('/user/profile')
    return response.data
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/user/profile', data)
    return response.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/user/password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
  },

  async getSessions(): Promise<{ sessions: any[] }> {
    const response = await api.get('/user/sessions')
    return response.data
  },

  async terminateSession(sessionId: string): Promise<void> {
    await api.delete(`/user/sessions/${sessionId}`)
  },
}

export { api }