'use client'

import { useEffect, useState } from 'react'
import { ApolloProvider, useQuery } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { GET_ROOMS } from '@/lib/graphql/queries'
import TeamBadge from '@/components/TeamBadge'
import Timer from '@/components/Timer'
import { sortRooms, getStatusLabel } from '@/lib/utils'

function DashboardContent() {
  const [rooms, setRooms] = useState<any[]>([])

  const { data: roomsData } = useQuery(GET_ROOMS, {
    pollInterval: 3000
  })

  useEffect(() => {
    if (roomsData?.rooms) {
      setRooms(sortRooms(roomsData.rooms))
    }
  }, [roomsData])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'FREE': return 'bg-status-free/10 text-status-free border-status-free/30'
      case 'OCCUPIED': return 'bg-status-occupied/10 text-status-occupied border-status-occupied/30'
      case 'RESERVED': return 'bg-status-reserved/10 text-status-reserved border-status-reserved/30'
      case 'OFFLINE': return 'bg-status-offline/10 text-status-offline border-status-offline/30'
      default: return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-orange-400">
              Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Přehled místností v reálném čase</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <a
              href="/"
              className="flex-1 md:flex-none text-center px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-sm font-semibold shadow-lg shadow-primary/30 transition-all text-white"
            >
              Výběr skupiny
            </a>
            <a
              href="/admin"
              className="flex-1 md:flex-none text-center px-6 py-3 bg-white/5 hover:bg-white/10 border border-orange-500/20 hover:border-orange-400/40 rounded-lg text-sm font-semibold transition-all text-gray-300 hover:text-white"
            >
              Admin Panel
            </a>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="card-hover p-4 animate-fade-in"
              style={{
                borderLeft: room.status !== 'FREE' ? `4px solid ${room.currentTeam?.color || 'transparent'}` : '4px solid transparent'
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">
                    {room.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5 truncate">
                    {room.description}
                  </p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full border font-semibold whitespace-nowrap ml-2 ${getStatusBadgeClass(room.status)}`}>
                  {getStatusLabel(room.status)}
                </span>
              </div>

              {/* Timer */}
              {room.status === 'OCCUPIED' && room.occupiedSince && (
                <Timer type="elapsed" time={room.occupiedSince} label="Obsazeno" />
              )}
              {room.status === 'RESERVED' && room.reservedUntil && (
                <Timer type="countdown" time={room.reservedUntil} label="Zbývá" />
              )}

              {/* Team Badge */}
              {room.currentTeam && (
                <div className="mt-3 pt-2 border-t border-orange-500/10">
                  <span className="text-[10px] text-text-muted uppercase tracking-wide mr-2">Drží:</span>
                  <TeamBadge name={room.currentTeam.name} color={room.currentTeam.color} />
                </div>
              )}

              {/* Link to detail */}
              <a
                href={`/dashboard/room/${room.id}`}
                className="mt-2 block text-center px-2 py-1 sm:py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 hover:border-orange-400/40 rounded-lg text-[10px] sm:text-xs font-medium text-orange-400 hover:text-orange-300 transition-all"
              >
                Detail
              </a>
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p className="text-text-muted">Načítání místností...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ApolloProvider client={client}>
      <DashboardContent />
    </ApolloProvider>
  )
}
