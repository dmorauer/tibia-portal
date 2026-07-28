'use client'

import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthStatus() {
  const { user, loading } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (loading) return null

  if (!user) {
    return (
      <div className="flex gap-4 text-sm">
        <a href="/login" className="underline">Entrar</a>
        <a href="/signup" className="underline">Criar conta</a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <span>Logado como {user.email}</span>
      <button onClick={handleLogout} className="underline">
        Sair
      </button>
    </div>
  )
}