'use client'

import { useState } from 'react'
import { ApolloProvider, useQuery, useMutation } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import { useParams, useRouter } from 'next/navigation'
import { GET_ROOMS, GET_HISTORY, ADMIN_SET_ROOM_STATUS } from '@/lib/graphql/queries'
import { toast } from 'sonner'
import Timer from '@/components/Timer'
import TeamBadge from '@/components/TeamBadge'
import RoomVisitHistory from '@/components/RoomVisitHistory'
import RoomDetailStats from '@/components/RoomDetailStats'
import { getStatusLabel } from '@/lib/utils'

function RoomDetailContent() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.id as string
  const [loading, setLoading] = useState(false)

  const { data: roomsData, refetch } = useQuery(GET_ROOMS, {
    pollInterval: 3000
  })

  const { data: historyData } = useQuery(GET_HISTORY, {
    variables: { filter: { roomId } },
    pollInterval: 5000
  })

  const [setRoomStatus] = useMutation(ADMIN_SET_ROOM_STATUS)

  const room = roomsData?.rooms?.find((r: any) => r.id === roomId)

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
          <div className="text-xl text-gray-400">Načítání...</div>
        </div>
      </div>
    )
  }

  const validVisits = filterValidVisits(historyData?.history || [])

  const handleBack = () => {
    router.push('/dashboard')
  }

  const handleQuickAction = async (status: string) => {
    setLoading(true)
    try {
      await setRoomStatus({
        variables: { roomId, status, teamId: null }
      })
      refetch()
      toast.success(status === 'FREE' ? 'Místnost uvolněna' : 'Místnost nastavena jako offline')
    } catch (error: any) {
      toast.error(error.message || 'Chyba při změně stavu')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = () => {
    switch (room.status) {
      case 'FREE': return 'bg-status-free/10 text-status-free border-status-free/30'
      case 'OCCUPIED': return 'bg-status-occupied/10 text-status-occupied border-status-occupied/30'
      case 'RESERVED': return 'bg-status-reserved/10 text-status-reserved border-status-reserved/30'
      case 'OFFLINE': return 'bg-status-offline/10 text-status-offline border-status-offline/30'
      default: return 'bg-orange-500/10 text-orange-400 border-orange-500/30'
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6 animate-fade-in">
          {/* Header with Back and Quick Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <button
              onClick={handleBack}
              className="btn-ghost border border-orange-500/20 hover:border-orange-400/40"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Zpět na Dashboard
            </button>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleQuickAction('FREE')}
                disabled={loading || room.status === 'FREE'}
                className="btn-success flex-1 sm:flex-none disabled:opacity-50"
              >
                Uvolnit
              </button>
              <button
                onClick={() => handleQuickAction(room.status === 'OFFLINE' ? 'FREE' : 'OFFLINE')}
                disabled={loading}
                className={`flex-1 sm:flex-none btn btn-md ${
                  room.status === 'OFFLINE'
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg shadow-gray-500/25'
                }`}
              >
                {room.status === 'OFFLINE' ? 'Online' : 'Offline'}
              </button>
            </div>
          </div>

          {/* Room Name & Description */}
          <div className="card p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{room.name}</h1>
            <p className="text-text-secondary">{room.description}</p>
          </div>

          {/* Current State Card */}
          <div className="card p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <div className="p-1.5 bg-orange-500/10 rounded-lg">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              Aktuální stav
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-text-secondary">Status:</span>
                <span className={`px-3 py-1 rounded-full border font-semibold text-sm ${getStatusBadgeClass()}`}>
                  {getStatusLabel(room.status)}
                </span>
              </div>

              {room.status === 'OCCUPIED' && room.occupiedSince && (
                <Timer type="elapsed" time={room.occupiedSince} label="Obsazeno" size="large" />
              )}
              {room.status === 'RESERVED' && room.reservedUntil && (
                <Timer type="countdown" time={room.reservedUntil} label="Zbývá rezervace" size="large" />
              )}

              {room.currentTeam && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">Drží:</span>
                  <TeamBadge name={room.currentTeam.name} color={room.currentTeam.color} />
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          <RoomDetailStats
            totalVisits={room.stats?.totalVisits || 0}
            averageMinutes={room.stats?.averageOccupationMinutes}
          />

          {/* Visit History */}
          <RoomVisitHistory visits={validVisits} />
        </div>
      </div>
    </div>
  )
}

function filterValidVisits(history: any[]) {
  const occupations = history.filter(h => h.action === 'OCCUPY')
  const visits: any[] = []

  for (const occupy of occupations) {
    const free = history.find(
      h => h.action === 'FREE' &&
           h.teamId === occupy.teamId &&
           new Date(h.timestamp) > new Date(occupy.timestamp)
    )

    if (free) {
      const duration = new Date(free.timestamp).getTime() - new Date(occupy.timestamp).getTime()
      const durationMinutes = Math.round(duration / 1000 / 60)

      if (durationMinutes >= 3) {
        visits.push({
          id: occupy.id,
          team: occupy.team,
          startTime: occupy.timestamp,
          endTime: free.timestamp,
          durationMinutes
        })
      }
    }
  }

  return visits.sort((a, b) =>
    new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  )
}

export default function RoomDetailPage() {
  return (
    <ApolloProvider client={client}>
      <RoomDetailContent />
    </ApolloProvider>
  )
}
