'use client'

import { useEffect, useState } from 'react'
import { ApolloProvider, useLazyQuery, useQuery } from '@apollo/client'
import { client } from '@/lib/apollo-client'
import TeamSetup from '@/components/TeamSetup'
import RoomsGrid from '@/components/RoomsGrid'
import { VALIDATE_TEAM_SESSION, GET_SESSION_VERSION } from '@/lib/graphql/queries'

interface Team {
  id: string
  name: string
  color: string
}

interface StoredSession {
  teamId: string
  sessionVersion: number
}

function HomeContent() {
  const [team, setTeam] = useState<Team | null>(null)
  const [validating, setValidating] = useState(true)

  const [validateTeamSession] = useLazyQuery(VALIDATE_TEAM_SESSION)
  const { data: versionData } = useQuery(GET_SESSION_VERSION)

  useEffect(() => {
    const validateSession = async () => {
      const savedSession = localStorage.getItem('teamSession')

      if (!savedSession) {
        setValidating(false)
        return
      }

      try {
        const session: StoredSession = JSON.parse(savedSession)

        const { data } = await validateTeamSession({
          variables: {
            teamId: session.teamId,
            sessionVersion: session.sessionVersion
          }
        })

        if (data?.validateTeamSession?.valid && data.validateTeamSession.team) {
          // Session is valid, set team
          setTeam(data.validateTeamSession.team)

          // Update session version if changed
          if (data.validateTeamSession.sessionVersion !== session.sessionVersion) {
            localStorage.setItem('teamSession', JSON.stringify({
              teamId: session.teamId,
              sessionVersion: data.validateTeamSession.sessionVersion
            }))
          }
        } else {
          // Session invalid - clear storage
          localStorage.removeItem('teamSession')
          localStorage.removeItem('team') // Clean up old format too
        }
      } catch (e) {
        console.error('Error validating session:', e)
        localStorage.removeItem('teamSession')
        localStorage.removeItem('team')
      }

      setValidating(false)
    }

    validateSession()
  }, [validateTeamSession])

  // Start auto-release job
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/cron').catch(console.error)
    }, 10 * 1000)

    return () => clearInterval(interval)
  }, [])

  const handleTeamCreated = (newTeam: Team) => {
    const currentVersion = versionData?.sessionVersion || 1

    // Store only teamId and sessionVersion
    localStorage.setItem('teamSession', JSON.stringify({
      teamId: newTeam.id,
      sessionVersion: currentVersion
    }))

    // Clean up old format
    localStorage.removeItem('team')

    setTeam(newTeam)
  }

  const handleLogout = () => {
    setTeam(null)
    localStorage.removeItem('teamSession')
    localStorage.removeItem('team')
  }

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
          <p className="text-text-muted">Ověřování session...</p>
        </div>
      </div>
    )
  }

  return !team ? (
    <TeamSetup onTeamCreated={handleTeamCreated} />
  ) : (
    <RoomsGrid team={team} onLogout={handleLogout} />
  )
}

export default function Home() {
  return (
    <ApolloProvider client={client}>
      <HomeContent />
    </ApolloProvider>
  )
}
