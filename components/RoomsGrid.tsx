'use client'

import { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import {
  GET_ROOMS,
  GET_CURRENT_STATS,
  OCCUPY_ROOM,
  RESERVE_ROOM,
  FREE_ROOM,
  CANCEL_RESERVATION
} from '@/lib/graphql/queries'
import RoomCard from './RoomCard'
import LiveCounter from './LiveCounter'
import TeamBadge from './TeamBadge'
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
    pollInterval: 3000 // Poll every 3 seconds for updates
  })
  const { data: statsData } = useQuery(GET_CURRENT_STATS, {
    pollInterval: 5000
  })

  const [occupyRoom] = useMutation(OCCUPY_ROOM)
  const [reserveRoom] = useMutation(RESERVE_ROOM)
  const [freeRoom] = useMutation(FREE_ROOM)
  const [cancelReservation] = useMutation(CANCEL_RESERVATION)

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

  const stats = statsData?.currentStats || {
    occupiedCount: 0,
    reservedCount: 0,
    totalRooms: 10
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative">
      {/* Top Right Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={onLogout}
          className="px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm border border-gray-700 rounded-lg text-xs font-medium text-gray-300 transition-all hover:text-white"
        >
          Změnit skupinu
        </button>
        <a
          href="/admin"
          className="px-3 py-1.5 bg-gray-800/80 hover:bg-primary/20 backdrop-blur-sm border border-gray-700 hover:border-primary/50 rounded-lg text-xs font-medium text-gray-300 transition-all hover:text-primary"
        >
          Admin
        </a>
      </div>

      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-blue-400 to-primary-dark bg-clip-text text-transparent inline-block">
            TeleRooms
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-gray-500 text-sm uppercase tracking-wider font-medium">Skupina</span>
            <TeamBadge name={team.name} color={team.color} />
          </div>
        </div>

        {/* Live Counter Dashboard */}
        <LiveCounter
          occupiedCount={stats.occupiedCount}
          reservedCount={stats.reservedCount}
          totalRooms={stats.totalRooms}
        />

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              currentTeamId={team.id}
              onOccupy={handleOccupy}
              onReserve={handleReserve}
              onFree={handleFree}
              onCancelReservation={handleCancelReservation}
            />
          ))}
        </div>

        {rooms.length === 0 && (
          <div className="text-center text-gray-400 mt-12">
            <p>Načítání místností...</p>
          </div>
        )}
      </div>
    </div>
  )
}
