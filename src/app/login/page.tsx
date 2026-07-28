'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/character')
    router.refresh()
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a0a05] px-4 py-12 relative overflow-hidden">
      <BackgroundFlames />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#8b6b3a_1px,transparent_1px),radial-gradient(circle_at_70%_60%,#8b6b3a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative w-full max-w-md bg-[#f4e4bc] rounded-md shadow-2xl border-2 border-[#8b6b3a] p-10">
        <CornerOrnaments />

        <header className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div style={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', border: '2px solid #8b6b3a' }}>
              <Image src="/Logo.png" alt="Tibia Idle" width={140} height={140} />
            </div>
          </div>
          <h1
            className="font-serif font-black tracking-widest"
            style={{
              fontSize: '1.875rem',
              color: '#f0c84a',
              textShadow: `
                1px 1px 0 #3d2a08,
                2px 2px 0 #2b1a05,
                3px 3px 0 #1a0f03,
                0 0 12px rgba(240, 200, 74, 0.4)
              `,
              letterSpacing: '0.15em',
            }}
          >
            TIBIA IDLE
          </h1>
          <p className="font-serif text-sm text-[#5a3a1a] mt-2 italic tracking-wider">
            ⚔ Forja · Combate · Conquista ⚔
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#8b6b3a] to-transparent" />
        </header>

        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block font-serif text-sm text-[#3a2410] mb-1.5 tracking-wide">
              Corvo Mensageiro (Email)
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aventureiro@reino.com"
              className="w-full rounded-sm border-2 border-[#8b6b3a] bg-[#faf0d7] px-3.5 py-2.5 font-serif text-[#3a2410] placeholder-[#a88a5a] italic transition focus:border-[#5a3a1a] focus:bg-[#fff8e1] focus:ring-2 focus:ring-[#8b6b3a]/30 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-serif text-sm text-[#3a2410] mb-1.5 tracking-wide">
              Palavra Secreta
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-sm border-2 border-[#8b6b3a] bg-[#faf0d7] px-3.5 py-2.5 font-serif text-[#3a2410] placeholder-[#a88a5a] italic transition focus:border-[#5a3a1a] focus:bg-[#fff8e1] focus:ring-2 focus:ring-[#8b6b3a]/30 focus:outline-none"
            />
          </div>

          {error && (
            <div role="alert" className="rounded-sm bg-[#5a2410]/10 border-2 border-[#5a2410] px-3 py-2.5 font-serif text-sm text-[#5a2410]">
              ⚔ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-gradient-to-b from-[#8b6b3a] to-[#5a3a1a] text-[#f4e4bc] py-3 font-serif text-lg tracking-widest uppercase border-2 border-[#3a2410] shadow-md transition hover:from-[#9a7a4a] hover:to-[#6a4a2a] active:translate-y-px focus:outline-none focus:ring-2 focus:ring-[#8b6b3a] focus:ring-offset-2 focus:ring-offset-[#f4e4bc] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Entrando...
              </span>
            ) : (
              'Entrar na Taverna'
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#8b6b3a]/40 text-center">
          <p className="font-serif text-sm text-[#5a3a1a]">
            Ainda não faz parte da guilda?{' '}
            <a href="/signup" className="font-serif text-[#3a2410] font-semibold underline decoration-[#8b6b3a] underline-offset-4 hover:decoration-[#3a2410]">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}

function BackgroundFlames() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(240, 200, 74, 0.12) 0%, transparent 60%)' }}
      />
      {Array.from({ length: 18 }).map((_, i) => {
        const left = (i * 53) % 100
        const delay = (i * 0.7) % 6
        const duration = 8 + (i % 5) * 2
        const size = 2 + (i % 3)
        return (
          <span
            key={i}
            className="absolute bottom-0 rounded-full"
            style={{
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              background: i % 2 === 0 ? '#f0c84a' : '#b8860b',
              boxShadow: `0 0 ${size * 3}px ${i % 2 === 0 ? '#f0c84a' : '#b8860b'}`,
              opacity: 0.6,
              animation: `ember ${duration}s ${delay}s linear infinite`,
            }}
          />
        )
      })}
      <style jsx>{`
        @keyframes ember {
          0% { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translateY(-50vh) translateX(20px) scale(0.8); }
          100% { transform: translateY(-100vh) translateX(-10px) scale(0.3); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

function CornerOrnaments() {
  const corner = "absolute h-4 w-4 border-[#8b6b3a]"
  return (
    <>
      <span className={`${corner} top-2 left-2 border-t-2 border-l-2`} />
      <span className={`${corner} top-2 right-2 border-t-2 border-r-2`} />
      <span className={`${corner} bottom-2 left-2 border-b-2 border-l-2`} />
      <span className={`${corner} bottom-2 right-2 border-b-2 border-r-2`} />
    </>
  )
}
