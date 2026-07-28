'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setStatus('success')
        setTimeout(() => router.push('/character'), 2000)
      }
      if (event === 'USER_UPDATED' && session) {
        setStatus('success')
        setTimeout(() => router.push('/character'), 2000)
      }
    })

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        setStatus('error')
        setErrorMsg(error.message)
      } else if (session) {
        setStatus('success')
        setTimeout(() => router.push('/character'), 2000)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a0a05] px-4 py-12 relative overflow-hidden">
      <BackgroundFlames />
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,#8b6b3a_1px,transparent_1px),radial-gradient(circle_at_70%_60%,#8b6b3a_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative w-full max-w-md bg-[#f4e4bc] rounded-md shadow-2xl border-2 border-[#8b6b3a] p-10 text-center">
        <CornerOrnaments />

        <div className="flex justify-center mb-6">
          <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', border: '2px solid #8b6b3a' }}>
            <Image src="/Logo.png" alt="Tibia Idle" width={100} height={100} />
          </div>
        </div>

        {status === 'loading' && (
          <>
            <h2 className="font-serif text-2xl text-[#3a2410] mb-3">Confirmando sua jornada...</h2>
            <p className="font-serif text-[#5a3a1a] mb-6">Aguarde enquanto verificamos seu juramento.</p>
            <Spinner />
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="font-serif text-2xl text-[#3a2410] mb-3">Juramento confirmado!</h2>
            <p className="font-serif text-[#5a3a1a] mb-6">Bem-vindo à guilda. Você será transportado à taverna em instantes.</p>
            <Spinner />
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="font-serif text-2xl text-[#3a2410] mb-3">Algo deu errado</h2>
            <div role="alert" className="rounded-sm bg-[#5a2410]/10 border-2 border-[#5a2410] px-3 py-2.5 font-serif text-sm text-[#5a2410] mb-6">
              ⚔ {errorMsg ?? 'Link inválido ou expirado.'}
            </div>
            <a
              href="/signup"
              className="font-serif text-sm text-[#3a2410] font-semibold underline decoration-[#8b6b3a] underline-offset-4 hover:decoration-[#3a2410]"
            >
              Tentar novamente
            </a>
          </>
        )}
      </div>
    </main>
  )
}

function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 text-[#8b6b3a]">
      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="font-serif text-sm italic">Viajando...</span>
    </div>
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
