'use client'

interface LiveCounterProps {
  occupiedCount: number
  reservedCount: number
  totalRooms: number
}

export default function LiveCounter({ occupiedCount, reservedCount, totalRooms }: LiveCounterProps) {
  const freeCount = totalRooms - occupiedCount - reservedCount
  
  // Calculate percentages for the bars
  const occupiedPercent = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0
  const reservedPercent = totalRooms > 0 ? (reservedCount / totalRooms) * 100 : 0
  const freePercent = totalRooms > 0 ? (freeCount / totalRooms) * 100 : 0

  return (
    <div className="bg-card/50 backdrop-blur-sm p-4 rounded-xl border border-gray-800 mb-8 max-w-3xl mx-auto shadow-xl">
      <div className="flex justify-between items-end mb-3 px-1">
        <div className="text-center w-1/3 border-r border-gray-800/50">
          <div className="text-sm text-gray-400 font-medium mb-1">Obsazeno</div>
          <div className="text-2xl font-bold text-status-occupied leading-none">{occupiedCount}</div>
        </div>
        <div className="text-center w-1/3 border-r border-gray-800/50">
          <div className="text-sm text-gray-400 font-medium mb-1">Rezervováno</div>
          <div className="text-2xl font-bold text-status-reserved leading-none">{reservedCount}</div>
        </div>
        <div className="text-center w-1/3">
          <div className="text-sm text-gray-400 font-medium mb-1">Volno</div>
          <div className="text-2xl font-bold text-status-free leading-none">{freeCount}</div>
        </div>
      </div>
      
      {/* Sleek single progress bar */}
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden flex w-full">
        <div 
          className="h-full bg-status-occupied transition-all duration-500 ease-out"
          style={{ width: `${occupiedPercent}%` }}
        />
        <div 
          className="h-full bg-status-reserved transition-all duration-500 ease-out"
          style={{ width: `${reservedPercent}%` }}
        />
        <div 
          className="h-full bg-status-free transition-all duration-500 ease-out"
          style={{ width: `${freePercent}%` }}
        />
      </div>
    </div>
  )
}