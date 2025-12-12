'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { GET_TEAMS } from '@/lib/graphql/queries'
import TeamBadge from './TeamBadge'

export default function TeamsPanel() {
  const [expanded, setExpanded] = useState(false)

  const { data, loading } = useQuery(GET_TEAMS, {
    skip: !expanded,
    pollInterval: expanded ? 5000 : 0
  })

  const teams = data?.teams || []

  const formatDate = (dateString: string) => {
    if (!dateString) return '--'

    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '--'

    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="bg-card rounded-lg shadow-lg mb-6 border border-primary/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex justify-between items-center hover:bg-primary/10 transition-colors rounded-lg"
      >
        <div>
          <h2 className="text-xl font-bold text-primary">Skupiny</h2>
          <p className="text-sm text-gray-400">Registrované skupiny ({teams.length})</p>
        </div>
        <span className="text-2xl text-primary">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="p-4 border-t border-gray-700">
          {loading ? (
            <p className="text-center text-gray-400 py-8">Načítání...</p>
          ) : teams.length === 0 ? (
            <p className="text-center text-gray-400 py-8">Zatím žádné skupiny</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team: any) => (
                <div
                  key={team.id}
                  className="bg-background rounded-lg p-4 border border-gray-700 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <TeamBadge name={team.name} color={team.color} />
                    {team.isArchived && (
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        Archivován
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border-2"
                        style={{
                          backgroundColor: team.color,
                          borderColor: team.color
                        }}
                      />
                      <code className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                        {team.color}
                      </code>
                    </div>

                    <div className="text-gray-400 text-xs">
                      <span className="text-gray-500">Vytvořen:</span>{' '}
                      {formatDate(team.createdAt)}
                    </div>

                    <div className="text-gray-500 text-xs font-mono break-all">
                      ID: {team.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
