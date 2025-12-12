'use client'

import { useState } from 'react'
import TeamBadge from './TeamBadge'
import Timer from './Timer'
import { getStatusEmoji, getStatusLabel } from '@/lib/utils'

interface Room {
  id: string
  name: string
  description: string
  status: string
  currentTeam?: {
    id: string
    name: string
    color: string
  }
  occupiedSince?: string
  reservedUntil?: string
}

interface RoomCardProps {
  room: Room
  currentTeamId?: string
  onOccupy?: (roomId: string) => Promise<void>
  onReserve?: (roomId: string) => Promise<void>
  onFree?: (roomId: string) => Promise<void>
  onCancelReservation?: (roomId: string) => Promise<void>
  isAdmin?: boolean
  onAdminAction?: (roomId: string, status: string, teamId?: string) => Promise<void>
}

export default function RoomCard({
  room,
  currentTeamId,
  onOccupy,
  onReserve,
  onFree,
  onCancelReservation,
  isAdmin,
  onAdminAction
}: RoomCardProps) {
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true)
    try {
      await action()
    } catch (error: any) {
      alert(error.message || 'Chyba při provádění akce')
    } finally {
      setLoading(false)
    }
  }

  const isOwnRoom = room.currentTeam?.id === currentTeamId
  const borderColor = room.currentTeam?.color || 'transparent'

  return (
    <div
      className="bg-card rounded-lg p-5 shadow-lg transition-all hover:shadow-xl hover:shadow-primary/20 border border-gray-700 hover:border-primary/50"
      style={{
        borderLeft: room.status !== 'FREE' ? `4px solid ${borderColor}` : '4px solid transparent'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-xl text-white">{room.name}</h3>
          <p className="text-sm text-gray-300 mt-1 font-semibold">{room.description}</p>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-gray-700/80 border border-gray-600 font-semibold whitespace-nowrap">
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
        <div className="mt-4 pt-3 border-t border-gray-700">
          <span className="text-xs text-gray-500 uppercase tracking-wide mr-2">Drží:</span>
          <TeamBadge name={room.currentTeam.name} color={room.currentTeam.color} />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-2 flex-wrap">
        {/* Regular user actions */}
        {!isAdmin && (
          <>
            {room.status === 'FREE' && onOccupy && (
              <button
                onClick={() => handleAction(() => onOccupy(room.id))}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-status-free text-white rounded-lg hover:bg-status-free/80 disabled:opacity-50 text-sm font-semibold shadow-lg shadow-status-free/30 transition-all"
              >
                Obsadit
              </button>
            )}
            {room.status === 'FREE' && onReserve && (
              <button
                onClick={() => handleAction(() => onReserve(room.id))}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-status-reserved text-white rounded-lg hover:bg-status-reserved/80 disabled:opacity-50 text-sm font-semibold shadow-lg shadow-status-reserved/30 transition-all"
              >
                Rezervovat
              </button>
            )}
            {room.status === 'OCCUPIED' && isOwnRoom && onFree && (
              <button
                onClick={() => handleAction(() => onFree(room.id))}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-status-occupied text-white rounded-lg hover:bg-status-occupied/80 disabled:opacity-50 text-sm font-semibold shadow-lg shadow-status-occupied/30 transition-all"
              >
                Uvolnit
              </button>
            )}
            {room.status === 'RESERVED' && isOwnRoom && onCancelReservation && (
              <button
                onClick={() => handleAction(() => onCancelReservation(room.id))}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 text-sm font-semibold transition-all"
              >
                Zrušit rezervaci
              </button>
            )}
          </>
        )}

        {/* Admin actions */}
        {isAdmin && onAdminAction && (
          <>
            <button
              onClick={() => handleAction(() => onAdminAction(room.id, 'FREE'))}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-status-free text-white rounded-lg hover:bg-status-free/80 disabled:opacity-50 text-sm font-medium transition-all"
            >
              Volná
            </button>
            <button
              onClick={() => handleAction(() => onAdminAction(room.id, room.status === 'OFFLINE' ? 'FREE' : 'OFFLINE'))}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 text-sm font-medium transition-all ${
                room.status === 'OFFLINE' 
                  ? 'bg-status-occupied hover:bg-status-occupied/80' // Green-ish when coming back online (visual cue "Turn On")
                  : 'bg-status-offline hover:bg-status-offline/80' // Grey/Red-ish when turning offline
              }`}
            >
              {room.status === 'OFFLINE' ? 'Online' : 'Offline'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
