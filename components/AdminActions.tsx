'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ADMIN_ARCHIVE_AND_RESET } from '@/lib/graphql/queries'

export default function AdminActions() {
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteTeams, setDeleteTeams] = useState(false)
  const [archiveAndReset, { loading }] = useMutation(ADMIN_ARCHIVE_AND_RESET)

  const handleReset = async () => {
    try {
      const { data } = await archiveAndReset({
        variables: { deleteTeams }
      })

      if (data?.adminArchiveAndReset?.success) {
        alert(data.adminArchiveAndReset.message)
        setShowConfirm(false)
        window.location.reload()
      }
    } catch (error: any) {
      alert(error.message || 'Chyba při archivaci')
    }
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-red-500">Admin funkce</h2>

      <button
        onClick={() => setShowConfirm(true)}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded transition-colors"
      >
        Resetovat a archivovat
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-card p-8 rounded-lg max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4 text-red-500">Potvrzení</h3>
            <p className="text-gray-300 mb-6">
              Tato akce archivuje celou historii, vytvoří denní statistiky a resetuje všechny místnosti na volné.
            </p>

            <div className="mb-6 p-4 bg-background rounded border border-gray-700">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteTeams}
                  onChange={(e) => setDeleteTeams(e.target.checked)}
                  className="w-5 h-5 mr-3"
                />
                <span className="text-gray-300">Smazat všechny skupiny</span>
              </label>
              <p className="text-xs text-gray-500 mt-2 ml-8">
                Pokud zaškrtnete, všechny skupiny budou smazány. Pokud ne, skupiny budou zachovány.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold rounded"
              >
                {loading ? 'Zpracování...' : 'Potvrdit'}
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false)
                  setDeleteTeams(false)
                }}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-bold rounded"
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
