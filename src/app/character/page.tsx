'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { IdleCharacter, Vocation } from '@/lib/types'
import { calcInitialStats } from '@/lib/vocation-config'
import { expForLevel } from '@/lib/experience'

const VOCATION_EXT: Record<string, string> = {
  knight:   'gif',
  paladin:  'gif',
  druid:    'png',
  sorcerer: 'png',
  monk:     'gif',
}

const VOCATION_DESC: Record<string, string> = {
  knight:   'Mestre do combate corpo a corpo, resistente e letal.',
  paladin:  'Equilibra arco e magia, ágil e versátil.',
  druid:    'Curandeiro da natureza, domina a cura e o frio.',
  sorcerer: 'Feiticeiro destrutivo, poder mágico sem igual.',
  monk:     'Guerreiro espiritual, une força e disciplina.',
}

const SKILL_LABEL: Record<string, string> = {
  melee:       'Corpo a Corpo',
  shield:      'Escudo',
  distance:    'Distância',
  magic_level: 'Nível Mágico',
}

type CharacterFull = IdleCharacter & {
  vocations: { name: string; slug: string } | null
}

export default function CharacterPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [character, setCharacter] = useState<CharacterFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return

    async function fetchCharacter() {
      const { data } = await supabase
        .from('idle_characters')
        .select('*, vocations(name, slug)')
        .eq('owner_id', user!.id)
        .maybeSingle()

      setCharacter(data)
      setLoading(false)
    }

    fetchCharacter()
  }, [user])

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#1a0a05]">
        <p className="font-serif text-[#f0c84a] animate-pulse">Carregando...</p>
      </main>
    )
  }

  if (!user) return null

  if (!character) {
    return <CharacterCreation userId={user.id} onCreate={setCharacter} />
  }

  return <CharacterDashboard character={character} />
}

// ─── Character Creation ───────────────────────────────────────────────────────

function CharacterCreation({
  userId,
  onCreate,
}: {
  userId: string
  onCreate: (c: CharacterFull) => void
}) {
  const [vocations, setVocations] = useState<Vocation[]>([])
  const [selected, setSelected] = useState<Vocation | null>(null)
  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [vocError, setVocError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('vocations')
      .select('*')
      .is('promoted_from_id', null)
      .order('id')
      .then(({ data, error }) => {
        if (error) setVocError(error.message)
        setVocations(data ?? [])
      })
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setError(null)
    setLoading(true)

    const { data, error: err } = await supabase
      .from('idle_characters')
      .insert({
        owner_id: userId,
        vocation_id: selected.id,
        gender,
        name: name.trim(),
        level: 1,
        experience: 0,
        gold: 0,
        stats: calcInitialStats(selected.id),
        inventory: [],
        last_tick_at: new Date().toISOString(),
      })
      .select('*, vocations(name, slug)')
      .single()

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    onCreate(data)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a0a05] px-4 py-12 relative overflow-hidden">
      <BackgroundFlames />

      <div className="relative w-full max-w-2xl bg-[#f4e4bc] rounded-md shadow-2xl border-2 border-[#8b6b3a] p-10">
        <CornerOrnaments />

        <header className="text-center mb-8">
          <h1
            className="font-serif font-black tracking-widest"
            style={{
              fontSize: '1.6rem',
              color: '#f0c84a',
              textShadow: '1px 1px 0 #3d2a08, 2px 2px 0 #2b1a05, 3px 3px 0 #1a0f03',
              letterSpacing: '0.15em',
            }}
          >
            CRIAR PERSONAGEM
          </h1>
          <p className="font-serif text-sm text-[#5a3a1a] mt-2 italic">
            Escolha seu nome e vocação para iniciar a jornada
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-[#8b6b3a] to-transparent" />
        </header>

        <form onSubmit={handleCreate} className="space-y-8">
          <div>
            <label htmlFor="charname" className="block font-serif text-sm text-[#3a2410] mb-1.5 tracking-wide">
              Nome do Personagem
            </label>
            <input
              id="charname"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Sir Aldric"
              maxLength={24}
              className="w-full rounded-sm border-2 border-[#8b6b3a] bg-[#faf0d7] px-3.5 py-2.5 font-serif text-[#3a2410] placeholder-[#a88a5a] italic transition focus:border-[#5a3a1a] focus:bg-[#fff8e1] focus:ring-2 focus:ring-[#8b6b3a]/30 focus:outline-none"
            />
          </div>

          <div>
            <p className="font-serif text-sm text-[#3a2410] mb-3 tracking-wide">Sexo</p>
            <div className="flex gap-3">
              {(['male', 'female'] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-sm border-2 font-serif text-sm tracking-wide transition ${
                    gender === g
                      ? 'border-[#5a3a1a] bg-[#5a3a1a] text-[#f4e4bc]'
                      : 'border-[#8b6b3a] bg-[#faf0d7] text-[#3a2410] hover:bg-[#fff8e1]'
                  }`}
                >
                  {g === 'male' ? 'Masculino' : 'Feminino'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-serif text-sm text-[#3a2410] mb-3 tracking-wide">Vocação</p>
            {vocError && (
              <p className="font-serif text-sm text-[#5a2410] mb-2">⚔ Erro ao carregar vocações: {vocError}</p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {vocations.map((voc) => (
                <button
                  key={voc.id}
                  type="button"
                  onClick={() => setSelected(voc)}
                  className={`rounded-sm border-2 p-4 text-left transition cursor-pointer ${
                    selected?.id === voc.id
                      ? 'border-[#5a3a1a] bg-[#5a3a1a]/10 shadow-inner'
                      : 'border-[#8b6b3a] bg-[#faf0d7] hover:bg-[#fff8e1] hover:border-[#5a3a1a]'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <Image
                      src={`/vocations/${voc.slug.charAt(0).toUpperCase() + voc.slug.slice(1)}.${VOCATION_EXT[voc.slug] ?? 'gif'}`}
                      alt={voc.name}
                      width={64}
                      height={64}
                      unoptimized
                      style={{ imageRendering: 'pixelated', mixBlendMode: 'multiply' }}
                    />
                  </div>
                  <span className="font-serif font-semibold text-[#3a2410] text-sm block text-center">{voc.name}</span>
                  <span className="font-serif text-[#8b6b3a] text-xs italic mt-1 block leading-snug text-center">
                    {VOCATION_DESC[voc.slug] ?? ''}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div role="alert" className="rounded-sm bg-[#5a2410]/10 border-2 border-[#5a2410] px-3 py-2.5 font-serif text-sm text-[#5a2410]">
              ⚔ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selected || !name.trim()}
            className="w-full rounded-sm bg-gradient-to-b from-[#8b6b3a] to-[#5a3a1a] text-[#f4e4bc] py-3 font-serif text-lg tracking-widest uppercase border-2 border-[#3a2410] shadow-md transition hover:from-[#9a7a4a] hover:to-[#6a4a2a] active:translate-y-px focus:outline-none focus:ring-2 focus:ring-[#8b6b3a] focus:ring-offset-2 focus:ring-offset-[#f4e4bc] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Forjando herói...' : 'Iniciar Jornada ⚔'}
          </button>
        </form>
      </div>
    </main>
  )
}

// ─── Character Dashboard ──────────────────────────────────────────────────────

function StatBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="w-full h-4 rounded-full bg-[#3a2410]/20 overflow-hidden border border-[#8b6b3a]/40">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

function CharacterDashboard({ character }: { character: CharacterFull }) {
  const voc = character.vocations
  const slug = voc?.slug ?? ''
  const stats = character.stats as Record<string, number>

  const hp      = stats.hp       ?? 0
  const maxHp   = stats.max_hp   ?? 0
  const mana    = stats.mana     ?? 0
  const maxMana = stats.max_mana ?? 0

  const skillKeys = Object.keys(stats).filter(k => !['hp', 'max_hp', 'mana', 'max_mana'].includes(k))

  const expCurrent = expForLevel(character.level)
  const expNext    = expForLevel(Math.min(character.level + 1, 1000))
  const expPct = character.level >= 1000
    ? 100
    : expNext > expCurrent
      ? Math.min(100, ((character.experience - expCurrent) / (expNext - expCurrent)) * 100)
      : 0

  return (
    <main className="min-h-screen bg-[#1a0a05] px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header — nome + vocação */}
        <div className="bg-[#f4e4bc] rounded-md border-2 border-[#8b6b3a] p-6 relative">
          <CornerOrnaments />
          <div className="flex items-center gap-5">
            {slug && (
              <div className="shrink-0 w-20 h-20 flex items-center justify-center bg-[#faf0d7] rounded-sm border border-[#8b6b3a]/60">
                <Image
                  src={`/vocations/${slug.charAt(0).toUpperCase() + slug.slice(1)}.${VOCATION_EXT[slug] ?? 'gif'}`}
                  alt={voc?.name ?? ''}
                  width={64}
                  height={64}
                  unoptimized
                  style={{ imageRendering: 'pixelated', mixBlendMode: 'multiply' }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-black text-[#3a2410] text-2xl truncate">{character.name}</h1>
              <p className="font-serif text-[#8b6b3a] text-sm italic">{voc?.name ?? '—'}</p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className="font-serif text-xs font-bold px-2.5 py-0.5 rounded-full border"
                  style={{ background: '#5a3a1a', color: '#f0c84a', borderColor: '#3a2410' }}
                >
                  Nível {character.level}
                </span>
                <span className="font-serif text-xs text-[#8b6b3a]">{character.gold} ouro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ir para Hunt */}
        <a
          href="/hunt"
          className="block w-full text-center rounded-sm bg-gradient-to-b from-[#8b6b3a] to-[#5a3a1a] text-[#f4e4bc] py-3.5 font-serif text-lg tracking-widest uppercase border-2 border-[#3a2410] shadow-md transition hover:from-[#9a7a4a] hover:to-[#6a4a2a] active:translate-y-px"
        >
          ⚔ Iniciar Hunt
        </a>

        {/* HP / Mana / Experiência */}
        <div className="bg-[#f4e4bc] rounded-md border-2 border-[#8b6b3a] p-6 space-y-4 relative">
          <CornerOrnaments />
          <h2 className="font-serif font-bold text-[#3a2410] text-sm tracking-widest uppercase mb-4">Atributos</h2>

          <div className="space-y-1">
            <div className="flex justify-between font-serif text-xs text-[#5a3a1a]">
              <span>Vida</span>
              <span>{hp} / {maxHp}</span>
            </div>
            <StatBar value={hp} max={maxHp} color="linear-gradient(90deg,#c0392b,#e74c3c)" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-serif text-xs text-[#5a3a1a]">
              <span>Mana</span>
              <span>{mana} / {maxMana}</span>
            </div>
            <StatBar value={mana} max={maxMana} color="linear-gradient(90deg,#2471a3,#3498db)" />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-serif text-xs text-[#5a3a1a]">
              <span>Experiência</span>
              <span>{character.level < 1000 ? `${expPct.toFixed(1)}%` : 'MAX'}</span>
            </div>
            <StatBar value={expPct} max={100} color="linear-gradient(90deg,#b8860b,#f0c84a)" />
          </div>
        </div>

        {/* Skills */}
        {skillKeys.length > 0 && (
          <div className="bg-[#f4e4bc] rounded-md border-2 border-[#8b6b3a] p-6 relative">
            <CornerOrnaments />
            <h2 className="font-serif font-bold text-[#3a2410] text-sm tracking-widest uppercase mb-4">Skills</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {skillKeys.map((key) => (
                <div key={key} className="flex items-center justify-between bg-[#faf0d7] border border-[#8b6b3a]/60 rounded-sm px-3 py-2">
                  <span className="font-serif text-sm text-[#3a2410]">{SKILL_LABEL[key] ?? key}</span>
                  <span className="font-serif text-sm font-bold text-[#5a3a1a]">{stats[key]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

// ─── Shared ───────────────────────────────────────────────────────────────────

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
