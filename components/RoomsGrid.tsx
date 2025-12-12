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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 pb-4 border-b border-gray-800">
          {/* Left: Title & Badge */}
          <div className="flex items-center gap-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-blue-400 to-primary-dark bg-clip-text text-transparent">
              TeleRooms
            </h1>
            <div className="h-8 w-px bg-gray-700 hidden md:block"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-xs uppercase tracking-wider font-medium hidden sm:inline-block">Skupina</span>
              <TeamBadge name={team.name} color={team.color} />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs font-medium text-gray-300 transition-all hover:text-white"
            >
              Změnit skupinu
            </button>
            <a
              href="/admin"
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/50 rounded-lg text-xs font-medium text-primary transition-all"
            >
              Admin
            </a>
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
