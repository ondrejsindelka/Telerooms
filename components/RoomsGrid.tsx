'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { toast } from 'sonner'
import {
  GET_ROOMS,
  OCCUPY_ROOM,
  RESERVE_ROOM,
  FREE_ROOM,
  CANCEL_RESERVATION,
  AUTO_RELEASE_EXPIRED_ROOM
} from '@/lib/graphql/queries'
import RoomCard from './RoomCard'
import TeamBadge from './TeamBadge'
import GlobalChat from './GlobalChat'
import { sortRooms } from '@/lib/utils'

interface RoomsGridProps {
  team: {
    id: string
    name: string
    color: string
  }
  onLogout: () => void
}

export default function RoomsGrid({ team, onLogout }: RoomsGridProps) {
  const [rooms, setRooms] = useState<any[]>([])

  const { data: roomsData, refetch } = useQuery(GET_ROOMS, {
    pollInterval: 3000
  })

  const [occupyRoom] = useMutation(OCCUPY_ROOM)
  const [reserveRoom] = useMutation(RESERVE_ROOM)
  const [freeRoom] = useMutation(FREE_ROOM)
  const [cancelReservation] = useMutation(CANCEL_RESERVATION)
  const [autoReleaseExpiredRoom] = useMutation(AUTO_RELEASE_EXPIRED_ROOM)

  useEffect(() => {
    if (roomsData?.rooms) {
      setRooms(sortRooms(roomsData.rooms, team.id))
    }
  }, [roomsData, team.id])

  const handleOccupy = async (roomId: string) => {
    await occupyRoom({
      variables: { roomId, teamId: team.id }
    })
    refetch()
  }

  const handleReserve = async (roomId: string) => {
    await reserveRoom({
      variables: { roomId, teamId: team.id }
    })
    refetch()
  }

  const handleFree = async (roomId: string) => {
    await freeRoom({
      variables: { roomId, teamId: team.id }
    })
    refetch()
  }

  const handleCancelReservation = async (roomId: string) => {
    await cancelReservation({
      variables: { roomId, teamId: team.id }
    })
    refetch()
  }

  const handleAutoRelease = async (roomId: string) => {
    try {
      await autoReleaseExpiredRoom({
        variables: { roomId }
      })
      refetch()
    } catch (error) {
      console.error('Auto-release failed:', error)
    }
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 animate-fade-in">
          {/* Title and Team Badge */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
              TeleRooms
            </h1>
            <TeamBadge name={team.name} color={team.color} />
          </div>

          {/* Change Team Button */}
          <button
            onClick={onLogout}
            className="btn-ghost w-full sm:w-auto border border-orange-500/20 hover:border-orange-400/40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Změnit skupinu
          </button>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room, index) => (
            <div
              key={room.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-slide-up"
            >
              <RoomCard
                room={room}
                currentTeamId={team.id}
                onOccupy={handleOccupy}
                onReserve={handleReserve}
                onFree={handleFree}
                onCancelReservation={handleCancelReservation}
                onAutoRelease={handleAutoRelease}
              />
            </div>
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center text-text-muted mt-12 animate-fade-in">
            <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
            <p>Načítání místností...</p>
          </div>
        )}
      </div>

      {/* Global Chat */}
      <GlobalChat team={team} />
    </div>
  )
}
