'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { ADMIN_ARCHIVE_AND_RESET, INVALIDATE_ALL_SESSIONS } from '@/lib/graphql/queries'

export default function AdminActions() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteTeams, setDeleteTeams] = useState(false)

  const [archiveAndReset, { loading }] = useMutation(ADMIN_ARCHIVE_AND_RESET)
  const [invalidateSessions, { loading: invalidating }] = useMutation(INVALIDATE_ALL_SESSIONS)

  const handleReset = async () => {
    try {
      const { data } = await archiveAndReset({
        variables: { deleteTeams }
      })

      if (data?.adminArchiveAndReset?.success) {
        // If teams were deleted, also invalidate all sessions
        if (deleteTeams) {
          await invalidateSessions()
        }

        toast.success(data.adminArchiveAndReset.message)
        setShowConfirm(false)
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při archivaci')
    }
  }

  const handleInvalidateSessions = async () => {
    if (!confirm('Opravdu chcete odhlásit všechny uživatele? Budou muset znovu vybrat skupinu.')) {
      return
    }

    try {
      const { data } = await invalidateSessions()
      if (data?.invalidateAllSessions) {
        toast.success(`Všichni uživatelé byli odhlášeni (verze: ${data.invalidateAllSessions.sessionVersion})`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při odhlašování')
    }
  }

  return (
    <div className="space-y-4">
      {/* Invalidate Sessions Button */}
      <button
        onClick={handleInvalidateSessions}
        disabled={invalidating}
        className="w-full py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 hover:border-orange-400/50 rounded-xl text-orange-400 font-medium transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        {invalidating ? 'Odhlašování...' : 'Odhlásit všechny uživatele'}
      </button>

      <div className="border-t border-orange-500/10 pt-4">
        <button
          onClick={() => setShowConfirm(true)}
          className="btn-danger w-full py-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Resetovat místnosti
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="card-elevated p-8 max-w-md w-full border-2 border-red-500/30 animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-400">Potvrzení</h3>
            </div>

            <p className="text-text-secondary mb-6">
              Tato akce archivuje celou historii, vytvoří denní statistiky a resetuje všechny místnosti na volné.
            </p>

            <div className="mb-6 p-4 card-hover border-red-500/20 hover:border-red-400/40">
              <label className="flex items-start cursor-pointer group">
                <input
                  type="checkbox"
                  checked={deleteTeams}
                  onChange={(e) => setDeleteTeams(e.target.checked)}
                  className="w-5 h-5 mr-3 mt-0.5 cursor-pointer accent-red-600 rounded"
                />
                <div>
                  <span className="text-red-400 font-medium group-hover:text-red-300 transition-colors">
                    Smazat všechny skupiny
                  </span>
                  <p className="text-xs text-text-muted mt-1">
                    Pokud zaškrtnete, všechny skupiny budou TRVALE SMAZÁNY včetně historie a všichni uživatelé budou automaticky odhlášeni.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={loading}
                className="btn-danger flex-1 py-3"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Zpracování...
                  </>
                ) : (
                  'Potvrdit'
                )}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setDeleteTeams(false)
                }}
                disabled={loading}
                className="btn-ghost flex-1 py-3 border border-gray-600"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
