'use client'

interface LiveCounterProps {
  occupiedCount: number
  reservedCount: number
  totalRooms: number
}

export default function LiveCounter({ occupiedCount, reservedCount, totalRooms }: LiveCounterProps) {
  const freeCount = totalRooms - occupiedCount - reservedCount

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg mb-6 border border-gray-700">
      <div className="grid grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-status-occupied mb-2">{occupiedCount}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Obsazeno</div>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-status-occupied transition-all"
              style={{ width: `${totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-status-reserved mb-2">{reservedCount}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rezervováno</div>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-status-reserved transition-all"
              style={{ width: `${totalRooms > 0 ? (reservedCount / totalRooms) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="text-center">
          <div className="text-4xl font-bold text-status-free mb-2">{freeCount}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Volno</div>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-status-free transition-all"
              style={{ width: `${totalRooms > 0 ? (freeCount / totalRooms) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
