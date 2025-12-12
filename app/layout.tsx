import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TeleRooms - Správa místností',
  description: 'Systém pro správu místností TeleRooms',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <main className="flex-grow">
            {children}
          </main>
          <footer className="p-4 text-center text-gray-500 text-sm">
            developed by <a href="https://sindelkaondrej.eu" className="hover:text-gray-300 transition-colors">sindelkaondrej.eu</a>
          </footer>
        </div>
      </body>
    </html>
  )
}
