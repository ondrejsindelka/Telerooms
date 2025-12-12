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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              TeleRooms
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-sm uppercase tracking-wider">Vaše skupina:</span>
              <TeamBadge name={team.name} color={team.color} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 w-full md:w-auto">
            <button
              onClick={onLogout}
              className="flex-1 sm:flex-none text-center px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs font-semibold transition-all"
            >
              Změnit skupinu
            </button>
            <a
              href="/admin"
              className="flex-1 sm:flex-none text-center px-3 py-2 bg-primary hover:bg-primary-dark rounded-lg text-xs font-semibold shadow-lg shadow-primary/30 transition-all text-white"
            >
              Admin
            </a>
          </div>
        </div>

        {/* Live Counter */}
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
