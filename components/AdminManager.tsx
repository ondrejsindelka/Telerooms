'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { GET_ADMINS, CREATE_ADMIN, DELETE_ADMIN } from '@/lib/graphql/queries'

interface Admin {
  id: string
  username: string
  createdAt: string
}

interface AdminManagerProps {
  currentAdminId: string
}

export default function AdminManager({ currentAdminId }: AdminManagerProps) {
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showForm, setShowForm] = useState(false)

  const { data, loading, refetch } = useQuery(GET_ADMINS)
  const [createAdmin, { loading: creating }] = useMutation(CREATE_ADMIN)
  const [deleteAdmin, { loading: deleting }] = useMutation(DELETE_ADMIN)

  const admins: Admin[] = data?.admins || []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error('Vyplňte všechna pole')
      return
    }

    try {
      await createAdmin({
        variables: { username: newUsername.trim(), password: newPassword }
      })
      toast.success('Admin vytvořen')
      setNewUsername('')
      setNewPassword('')
      setShowForm(false)
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Chyba při vytváření admina')
    }
  }

  const handleDelete = async (admin: Admin) => {
    if (admin.id === currentAdminId) {
      toast.error('Nemůžete smazat sám sebe')
      return
    }

    if (!confirm(`Opravdu chcete smazat admina "${admin.username}"?`)) {
      return
    }

    try {
      const { data } = await deleteAdmin({ variables: { id: admin.id } })
      if (data?.deleteAdmin?.success) {
        toast.success(data.deleteAdmin.message)
        refetch()
      } else {
        toast.error(data?.deleteAdmin?.message || 'Chyba při mazání')
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při mazání admina')
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Správa administrátorů</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary btn-sm"
        >
          {showForm ? 'Zrušit' : '+ Přidat admina'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Uživatelské jméno
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                className="input text-sm"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Heslo
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={creating}
            className="btn-success btn-sm w-full"
          >
            {creating ? 'Vytváření...' : 'Vytvořit admina'}
          </button>
        </form>
      )}

      {/* Admin List */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-4">
            <div className="inline-block w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          </div>
        ) : admins.length === 0 ? (
          <p className="text-center text-text-muted py-4">Žádní administrátoři</p>
        ) : (
          admins.map((admin) => (
            <div
              key={admin.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                admin.id === currentAdminId
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-white/5 border-orange-500/10'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{admin.username}</span>
                  {admin.id === currentAdminId && (
                    <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
                      Vy
                    </span>
                  )}
                </div>
                <span className="text-xs text-text-muted">
                  Vytvořen: {formatDate(admin.createdAt)}
                </span>
              </div>
              {admin.id !== currentAdminId && (
                <button
                  onClick={() => handleDelete(admin)}
                  disabled={deleting}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                  title="Smazat admina"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
