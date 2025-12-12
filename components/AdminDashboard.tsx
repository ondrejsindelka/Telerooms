'use client'

import { useQuery } from '@apollo/client'
import { GET_CURRENT_STATS } from '@/lib/graphql/queries'

export default function AdminDashboard() {
  const { data } = useQuery(GET_CURRENT_STATS, {
    pollInterval: 5000
  })

  const stats = data?.currentStats || {
    occupiedCount: 0,
    reservedCount: 0,
    totalRooms: 10,
    activeTeams: 0
  }

  const occupancyRate = ((stats.occupiedCount + stats.reservedCount) / stats.totalRooms * 100).toFixed(1)

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg mb-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-primary">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-background p-4 rounded-lg border border-gray-700 hover:border-status-occupied/50 transition-all">
          <div className="flex justify-between items-center mb-1">
            <div className="text-3xl font-bold text-status-occupied">{stats.occupiedCount}</div>
            <div className="p-2 bg-status-occupied/10 rounded-full">
              <span className="block w-2 h-2 rounded-full bg-status-occupied"></span>
            </div>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Obsazeno</div>
        </div>

        <div className="bg-background p-4 rounded-lg border border-gray-700 hover:border-status-reserved/50 transition-all">
          <div className="flex justify-between items-center mb-1">
            <div className="text-3xl font-bold text-status-reserved">{stats.reservedCount}</div>
            <div className="p-2 bg-status-reserved/10 rounded-full">
              <span className="block w-2 h-2 rounded-full bg-status-reserved"></span>
            </div>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Rezervováno</div>
        </div>

        <div className="bg-background p-4 rounded-lg border border-gray-700 hover:border-primary/50 transition-all">
          <div className="flex justify-between items-center mb-1">
            <div className="text-3xl font-bold text-primary">{stats.activeTeams}</div>
            <div className="p-2 bg-primary/10 rounded-full">
              <span className="block w-2 h-2 rounded-full bg-primary"></span>
            </div>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Aktivní skupiny</div>
        </div>

        <div className="bg-background p-4 rounded-lg border border-gray-700 hover:border-status-free/50 transition-all">
          <div className="flex justify-between items-center mb-1">
            <div className="text-3xl font-bold text-status-free">{occupancyRate}%</div>
            <div className="p-2 bg-status-free/10 rounded-full">
              <span className="block w-2 h-2 rounded-full bg-status-free"></span>
            </div>
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium">Zaplněnost</div>
        </div>
      </div>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="bg-background rounded-full h-6 overflow-hidden border border-gray-700">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-dark transition-all flex items-center justify-end pr-3"
            style={{ width: `${occupancyRate}%` }}
          >
            <span className="text-xs font-bold text-white">{occupancyRate}%</span>
          </div>
        </div>
        <div className="text-sm text-gray-400 text-center">
          {stats.occupiedCount + stats.reservedCount} / {stats.totalRooms} místností využito
        </div>
      </div>
    </div>
  )
}
