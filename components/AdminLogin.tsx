'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { toast } from 'sonner'
import { ADMIN_LOGIN } from '@/lib/graphql/queries'

interface AdminLoginProps {
  onLogin: (token: string, admin: { id: string; username: string }) => void
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [adminLogin, { loading }] = useMutation(ADMIN_LOGIN)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      toast.error('Vyplňte uživatelské jméno a heslo')
      return
    }

    try {
      const { data } = await adminLogin({
        variables: { username: username.trim(), password }
      })

      if (data?.adminLogin?.success) {
        toast.success('Přihlášení úspěšné')
        onLogin(data.adminLogin.token, data.adminLogin.admin)
      } else {
        toast.error(data?.adminLogin?.message || 'Přihlášení se nezdařilo')
      }
    } catch (error: any) {
      toast.error(error.message || 'Chyba při přihlášení')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card-elevated p-8 sm:p-10 max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 mb-4">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2 text-white">
            Admin Panel
          </h1>
          <p className="text-text-secondary">
            Přihlaste se pro přístup k administraci
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2 text-text-secondary">
              Uživatelské jméno
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="admin"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-text-secondary">
              Heslo
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-lg"
          >
            {loading ? 'Přihlašování...' : 'Přihlásit se'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-orange-500/10 text-center">
          <a
            href="/"
            className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
          >
            ← Zpět na výběr skupiny
          </a>
        </div>
      </div>
    </div>
  )
}
