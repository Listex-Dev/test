import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Player } from '@/components/player/Player'
import { AuthModals } from '@/components/auth/AuthModals'
import { ContextMenu } from '@/components/ui/ContextMenu'
import { Equalizer } from '@/components/player/Equalizer'
import { LyricsModal } from '@/components/player/LyricsModal'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'ReMusic - Музыкальный плеер',
  description: 'Современный музыкальный плеер с поддержкой YouTube',
  manifest: '/manifest.json',
  themeColor: '#1DB954',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} bg-spotify-dark text-white min-h-screen`}>
        <Providers>
          <div className="flex h-screen">
            <Header />
            <Sidebar />
            <main className="ml-64 flex-1 pt-16 pb-24 overflow-y-auto">
              <div className="p-8">
                {children}
              </div>
            </main>
            <Player />
            <AuthModals />
            <ContextMenu />
            <Equalizer />
            <LyricsModal />
          </div>
        </Providers>
      </body>
    </html>
  )
}