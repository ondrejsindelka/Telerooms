import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TeleRooms',
  description: 'Systém pro správu místností TeleRooms',
}

export const viewport: Viewport = {
  themeColor: '#042f2e',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs" className="dark">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            {children}
          </main>
          <footer className="p-4 text-center text-gray-500 text-sm">
            developed by <a href="https://sindelkaondrej.eu" className="hover:text-gray-300 transition-colors">sindelkaondrej.eu</a>
          </footer>
        </div>
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: 'rgb(17, 24, 39)',
              border: '1px solid rgb(55, 65, 81)',
              color: 'rgb(243, 244, 246)',
            },
          }}
        />
      </body>
    </html>
  )
}
