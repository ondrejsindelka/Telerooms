'use client'

import { useEffect, useState } from 'react'
import { ApolloProvider, useQuery, useMutation } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import {
  GET_ROOMS,
  ADMIN_SET_ROOM_STATUS
} from '@/lib/graphql/queries'
import RoomCard from '@/components/RoomCard'
import LiveCounter from '@/components/LiveCounter'
import AdminDashboard from '@/components/AdminDashboard'
import HistoryTable from '@/components/HistoryTable'
import AdminActions from '@/components/AdminActions'
import TeamsPanel from '@/components/TeamsPanel'
import RoomManager from '@/components/RoomManager'
import { sortRooms } from '@/lib/utils'
import { startAutoReleaseJob } from '@/lib/auto-release'

function AdminContent() {
  const [rooms, setRooms] = useState<any[]>([])

  const { data: roomsData, refetch } = useQuery(GET_ROOMS, {
    pollInterval: 3000 // Poll every 3 seconds for updates
  })
  const [setRoomStatus] = useMutation(ADMIN_SET_ROOM_STATUS)

  useEffect(() => {
    if (roomsData?.rooms) {
      setRooms(sortRooms(roomsData.rooms))
    }
  }, [roomsData])

  const handleAdminAction = async (roomId: string, status: string, teamId?: string) => {
    await setRoomStatus({
      variables: { roomId, status, teamId: teamId || null }
    })
    refetch()
  }

  const stats = rooms.reduce(
    (acc, room) => {
      if (room.status === 'OCCUPIED') acc.occupiedCount++
      if (room.status === 'RESERVED') acc.reservedCount++
      return acc
    },
    { occupiedCount: 0, reservedCount: 0, totalRooms: rooms.length }
  )

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400 text-lg">Správa TeleRooms</p>
          </div>
          <a
            href="/"
            className="w-full md:w-auto text-center px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-sm font-semibold shadow-lg shadow-primary/30 transition-all text-white"
          >
            ← Uživatelská verze
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar / Tools Column */}
          <div className="space-y-6">
            <AdminDashboard />
            <AdminActions />
            <RoomManager />
            <TeamsPanel />
          </div>

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
            <LiveCounter
              occupiedCount={stats.occupiedCount}
              reservedCount={stats.reservedCount}
              totalRooms={stats.totalRooms}
            />

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  isAdmin={true}
                  onAdminAction={handleAdminAction}
                />
              ))}
            </div>

            <HistoryTable />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/cron').catch(console.error)
    }, 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <ApolloProvider client={client}>
      <AdminContent />
    </ApolloProvider>
  )
}
