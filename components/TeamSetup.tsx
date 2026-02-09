'use client'

import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { toast } from 'sonner'
import { CREATE_TEAM, GET_TEAMS } from '@/lib/graphql/queries'
import TeamBadge from './TeamBadge'

interface TeamSetupProps {
  onTeamCreated: (team: { id: string; name: string; color: string }) => void
}

export default function TeamSetup({ onTeamCreated }: TeamSetupProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#f97316')
  const [createTeam, { loading: creating }] = useMutation(CREATE_TEAM)
  const { data: teamsData, loading: loadingTeams } = useQuery(GET_TEAMS, {
    pollInterval: 5000
  })

  const existingTeams = teamsData?.teams || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('Zadejte název skupiny')
      return
    }

    try {
      const { data } = await createTeam({
        variables: { name: name.trim(), color }
      })

      if (data?.createTeam) {
        toast.success('Skupina úspěšně vytvořena!')
        onTeamCreated(data.createTeam)
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při vytváření skupiny')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-elevated p-8 sm:p-10 max-w-4xl w-full flex flex-col md:flex-row gap-8 md:gap-10 animate-fade-in">

        {/* Create Team Section */}
        <div className="flex-1">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-3 gradient-text">
              TeleRooms
            </h1>
            <p className="text-text-secondary text-lg">
              Vytvořte novou skupinu
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3 text-text-secondary">
                Název skupiny
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Napr. Skupina A"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-text-secondary">
                Barva skupiny
              </label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-24 h-14 rounded-xl cursor-pointer border-2 border-orange-500/20 hover:border-orange-400/50 transition-colors bg-transparent"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="input flex-1 font-mono uppercase"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="btn-primary w-full py-4 text-lg"
            >
              {creating ? 'Vytváření...' : 'Vytvořit skupinu'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-orange-500/10">
            <p className="text-xs text-text-muted text-center leading-relaxed">
              Název skupiny musí být unikátní<br />
              Barva slouží k identifikaci vašich místností
            </p>
          </div>

          <div className="mt-6 text-center space-y-2">
            <a
              href="/dashboard"
              className="block text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Přejít na Dashboard
            </a>
            <a
              href="/admin"
              className="block text-xs text-gray-500 hover:text-gray-400 transition-colors"
            >
              Admin Panel
            </a>
          </div>
        </div>

        {/* Existing Teams Section */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-orange-500/10 pt-8 md:pt-0 md:pl-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-3 text-white">
              Existující skupiny
            </h2>
            <p className="text-text-secondary text-sm">
              Klikněte pro přihlášení ke skupině
            </p>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {loadingTeams ? (
              <div className="py-8 text-center">
                <div className="inline-block w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-text-muted mt-2">Načítání skupin...</p>
              </div>
            ) : existingTeams.length === 0 ? (
              <p className="text-center text-text-muted py-8">Zatím žádné skupiny</p>
            ) : (
              existingTeams.map((team: any) => (
                <button
                  key={team.id}
                  onClick={() => onTeamCreated(team)}
                  className="w-full flex items-center justify-between p-4 card-hover group"
                >
                  <TeamBadge name={team.name} color={team.color} />
                  <span className="text-text-muted text-sm group-hover:text-orange-400 transition-colors flex items-center gap-1">
                    Přihlásit
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
