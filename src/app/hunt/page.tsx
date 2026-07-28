'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import type { IdleCharacter } from '@/lib/types'
import { expForLevel } from '@/lib/experience'
import { GameNav } from '@/app/components/GameNav'

// ─── Constants ────────────────────────────────────────────────────────────────

const VOCATION_EXT: Record<string, string> = {
  knight: 'gif', paladin: 'gif', druid: 'png', sorcerer: 'png', monk: 'gif',
}

// Waypoints percorrem a área de terra marrom do mapa hunt.png
const WAYPOINTS = [
  { x: 18, y: 60 },
  { x: 32, y: 45 },
  { x: 46, y: 58 },
  { x: 60, y: 42 },
  { x: 73, y: 55 },
  { x: 83, y: 38 },
]

const COMBAT_RANGE = 10   // % distance to start combat
const WALK_SPEED   = 0.25 // % per movement tick
const MOVE_TICK_MS = 50   // movement update interval
const COMBAT_TICK_MS = 2000

type MonsterDef = {
  name: string; hp: number; attack: number; defense: number
  xp: number; gold: [number, number]; sprite: string; minLevel: number
}

const MONSTERS: MonsterDef[] = [
  { name: 'Troll', hp: 50, attack: 18, defense: 6, xp: 20, gold: [0, 5], sprite: 'Troll', minLevel: 1 },
]

function getMonster(level: number): MonsterDef {
  const eligible = MONSTERS.filter(m => m.minLevel <= level)
  return eligible[eligible.length - 1] ?? MONSTERS[0]
}

type CharacterFull = IdleCharacter & { vocations: { name: string; slug: string } | null }
type FloatNum = { id: number; text: string; color: string; wx: number; wy: number }
type LogEntry = { id: number; text: string }
type Pos = { x: number; y: number }

// ─── Map canvas drawing ────────────────────────────────────────────────────────

// ─── Pages ────────────────────────────────────────────────────────────────────

export default function HuntPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [character, setCharacter] = useState<CharacterFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.push('/login')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    supabase
      .from('idle_characters')
      .select('*, vocations(name, slug)')
      .eq('owner_id', user.id)
      .maybeSingle()
      .then(({ data }) => { setCharacter(data); setLoading(false) })
  }, [user])

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#1a0a05]">
        <p className="font-serif text-[#f0c84a] animate-pulse">Carregando...</p>
      </main>
    )
  }
  if (!user || !character) return null
  return <HuntArena character={character} />
}

// ─── Arena ────────────────────────────────────────────────────────────────────

function HuntArena({ character }: { character: CharacterFull }) {
  const stats    = character.stats as Record<string, number>
  const slug     = character.vocations?.slug ?? ''
  const maxHp    = stats.max_hp   ?? 145
  const maxMana  = stats.max_mana ?? 35

  // Game state (refs for loop, state for render)
  const [charPos,  setCharPos]  = useState<Pos>({ x: WAYPOINTS[0].x, y: WAYPOINTS[0].y })
  const [monPos,   setMonPos]   = useState<Pos>({ x: WAYPOINTS[WAYPOINTS.length-1].x, y: WAYPOINTS[WAYPOINTS.length-1].y })
  const [monDef,   setMonDef]   = useState<MonsterDef>(getMonster(character.level))
  const [charHp,   setCharHp]   = useState(stats.hp   ?? maxHp)
  const [monHp,    setMonHp]    = useState(() => getMonster(character.level).hp)
  const [charXp,   setCharXp]   = useState(character.experience)
  const [charLvl,  setCharLvl]  = useState(character.level)
  const [charGold, setCharGold] = useState(character.gold)
  const [phase,    setPhase]    = useState<'walking'|'combat'|'dead'>('walking')
  const [floats,   setFloats]   = useState<FloatNum[]>([])
  const [log,      setLog]      = useState<LogEntry[]>([])
  const [charFlip, setCharFlip] = useState(false) // true = facing left (dead/retreating)

  // Refs for loop (avoid stale closures)
  const charPosRef  = useRef(charPos)
  const monPosRef   = useRef(monPos)
  const monDefRef   = useRef(monDef)
  const monHpRef    = useRef(monHp)
  const charHpRef   = useRef(charHp)
  const charXpRef   = useRef(charXp)
  const charLvlRef  = useRef(charLvl)
  const charGoldRef = useRef(charGold)
  const phaseRef    = useRef(phase)
  const nextId      = useRef(0)
  const moveTimer   = useRef<ReturnType<typeof setInterval>|null>(null)
  const combatTimer = useRef<ReturnType<typeof setInterval>|null>(null)

  charPosRef.current  = charPos
  monPosRef.current   = monPos
  monDefRef.current   = monDef
  monHpRef.current    = monHp
  charHpRef.current   = charHp
  charXpRef.current   = charXp
  charLvlRef.current  = charLvl
  charGoldRef.current = charGold
  phaseRef.current    = phase


  function addFloat(text: string, color: string, pos: Pos) {
    const id = nextId.current++
    setFloats(f => [...f, { id, text, color, wx: pos.x, wy: pos.y }])
    setTimeout(() => setFloats(f => f.filter(n => n.id !== id)), 1500)
  }

  function addLog(text: string) {
    const id = nextId.current++
    setLog(l => [{ id, text }, ...l].slice(0, 30))
  }

  const spawnMonster = useCallback((level: number) => {
    const m = getMonster(level)
    const pos = { x: WAYPOINTS[WAYPOINTS.length-1].x, y: WAYPOINTS[WAYPOINTS.length-1].y }
    setMonDef(m)
    setMonHp(m.hp)
    setMonPos(pos)
    monDefRef.current = m
    monHpRef.current  = m.hp
    monPosRef.current = pos
  }, [])

  // ── Combat tick ──
  const startCombat = useCallback(() => {
    if (combatTimer.current) clearInterval(combatTimer.current)

    combatTimer.current = setInterval(() => {
      if (phaseRef.current !== 'combat') return

      const skillLvl = (character.stats as Record<string,number>).melee
        ?? (character.stats as Record<string,number>).distance
        ?? (character.stats as Record<string,number>).magic_level
        ?? 10

      // Char attacks monster
      const minDmg = Math.max(1, Math.floor(skillLvl * 0.3))
      const maxDmg = Math.max(minDmg + 1, Math.floor(skillLvl * 0.8))
      const charDmg = Math.floor(Math.random() * (maxDmg - minDmg + 1)) + minDmg

      const newMonHp = Math.max(0, monHpRef.current - charDmg)
      setMonHp(newMonHp); monHpRef.current = newMonHp
      addFloat(`-${charDmg}`, '#ff4444', monPosRef.current)
      addLog(`${character.name} causou ${charDmg} de dano ao ${monDefRef.current.name}.`)

      if (newMonHp <= 0) {
        // Monster dies
        const m = monDefRef.current
        const gold = Math.floor(Math.random() * (m.gold[1] - m.gold[0] + 1)) + m.gold[0]
        const newXp   = charXpRef.current + m.xp
        const newGold = charGoldRef.current + gold
        const newLvl  = calcLevel(newXp, charLvlRef.current)

        setCharXp(newXp);   charXpRef.current   = newXp
        setCharGold(newGold); charGoldRef.current = newGold
        if (newLvl > charLvlRef.current) {
          setCharLvl(newLvl); charLvlRef.current = newLvl
          addLog(`⭐ Subiu para o nível ${newLvl}!`)
        }

        addFloat(`+${m.xp} XP`, '#f0c84a', charPosRef.current)
        if (gold > 0) addFloat(`+${gold} ouro`, '#f0c84a', monPosRef.current)
        addLog(`${m.name} morreu! +${m.xp} XP, +${gold} ouro.`)

        supabase.from('idle_characters')
          .update({ experience: newXp, gold: newGold, level: charLvlRef.current })
          .eq('id', character.id)

        if (combatTimer.current) clearInterval(combatTimer.current)
        setPhase('walking'); phaseRef.current = 'walking'
        setTimeout(() => spawnMonster(charLvlRef.current), 600)
        return
      }

      // Monster attacks char
      const monDmg = Math.max(1, monDefRef.current.attack - Math.floor(Math.random() * 6))
      const newCharHp = Math.max(0, charHpRef.current - monDmg)
      setCharHp(newCharHp); charHpRef.current = newCharHp
      addFloat(`-${monDmg}`, '#ff8888', charPosRef.current)
      addLog(`${monDefRef.current.name} causou ${monDmg} de dano a ${character.name}.`)

      if (newCharHp <= 0) {
        if (combatTimer.current) clearInterval(combatTimer.current)
        setPhase('dead'); phaseRef.current = 'dead'
        addLog(`${character.name} morreu! Revivendo em 5s...`)
        setTimeout(() => {
          setCharHp(maxHp); charHpRef.current = maxHp
          setCharPos(WAYPOINTS[0]); charPosRef.current = WAYPOINTS[0]
          spawnMonster(charLvlRef.current)
          setPhase('walking'); phaseRef.current = 'walking'
        }, 5000)
      }
    }, COMBAT_TICK_MS)
  }, [character, maxHp, spawnMonster])

  // ── Movement tick ──
  useEffect(() => {
    if (moveTimer.current) clearInterval(moveTimer.current)

    moveTimer.current = setInterval(() => {
      if (phaseRef.current !== 'walking') return

      const cp = charPosRef.current
      const mp = monPosRef.current
      const dx = mp.x - cp.x
      const dy = mp.y - cp.y
      const dist = Math.sqrt(dx*dx + dy*dy)

      if (dist < COMBAT_RANGE) {
        setPhase('combat'); phaseRef.current = 'combat'
        setCharFlip(false)
        startCombat()
        return
      }

      const speed = Math.min(WALK_SPEED, dist)
      const nx = cp.x + (dx/dist) * speed
      const ny = cp.y + (dy/dist) * speed
      setCharPos({ x: nx, y: ny })
      charPosRef.current = { x: nx, y: ny }
      setCharFlip(dx < 0)
    }, MOVE_TICK_MS)

    return () => { if (moveTimer.current) clearInterval(moveTimer.current) }
  }, [startCombat])

  // ── Derived display values ──
  const expCurrent = expForLevel(charLvl)
  const expNext    = expForLevel(Math.min(charLvl + 1, 1000))
  const expPct = charLvl >= 1000 ? 100
    : expNext > expCurrent ? Math.min(100, ((charXp - expCurrent) / (expNext - expCurrent)) * 100) : 0

  return (
    <main className="min-h-screen bg-[#0a0401] flex flex-col">

      {/* ── Top HUD ── */}
      <header className="bg-[#0f0603] border-b border-[#3a2410] px-3 py-2 flex items-center gap-3 flex-wrap shrink-0">
        <GameNav characterName={character.name} />

        <div className="flex items-center gap-1.5">
          <span className="font-serif text-[10px] text-[#c0392b]">HP</span>
          <div className="w-24 h-2.5 rounded-full bg-black/40 overflow-hidden border border-[#3a2410]/60">
            <div className="h-full bg-gradient-to-r from-[#c0392b] to-[#e74c3c] transition-all" style={{ width: `${(charHp/maxHp)*100}%` }} />
          </div>
          <span className="font-serif text-[10px] text-[#c0392b]">{charHp}/{maxHp}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-serif text-[10px] text-[#2471a3]">MP</span>
          <div className="w-24 h-2.5 rounded-full bg-black/40 overflow-hidden border border-[#3a2410]/60">
            <div className="h-full bg-gradient-to-r from-[#2471a3] to-[#3498db] transition-all" style={{ width: `${(stats.mana??maxMana)/maxMana*100}%` }} />
          </div>
          <span className="font-serif text-[10px] text-[#2471a3]">{stats.mana ?? maxMana}/{maxMana}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-serif text-[10px] text-[#f0c84a]">XP</span>
          <div className="w-24 h-2.5 rounded-full bg-black/40 overflow-hidden border border-[#3a2410]/60">
            <div className="h-full bg-gradient-to-r from-[#b8860b] to-[#f0c84a] transition-all" style={{ width: `${expPct}%` }} />
          </div>
          <span className="font-serif text-[10px] text-[#f0c84a]">{expPct.toFixed(1)}%</span>
        </div>

        <span className="font-serif text-xs text-[#f0c84a] ml-auto">
          Nível {charLvl} · 🪙 {charGold}
        </span>
      </header>

      {/* ── Map ── */}
      <div
        className="relative flex-1 overflow-hidden"
        style={{ minHeight: 320 }}
      >
        <Image
          src="/maps/hunt.png"
          alt="Hunt map"
          fill
          unoptimized
          className="object-cover"
          style={{ imageRendering: 'pixelated' }}
          priority
        />

        {/* Floating numbers */}
        {floats.map(f => (
          <div
            key={f.id}
            className="absolute pointer-events-none font-serif font-black text-base select-none"
            style={{
              left: `${f.wx}%`,
              top:  `${f.wy}%`,
              color: f.color,
              textShadow: '1px 1px 2px #000, -1px -1px 2px #000',
              animation: 'floatUp 1.5s ease-out forwards',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            {f.text}
          </div>
        ))}

        {/* Character sprite */}
        {slug && (
          <>
            <div
              className="absolute pointer-events-none"
              style={{
                left:         `${charPos.x}%`,
                top:          `${charPos.y}%`,
                transform:    `translate(-50%, -100%) scaleX(${charFlip ? -1 : 1})`,
                transition:   `left ${MOVE_TICK_MS}ms linear, top ${MOVE_TICK_MS}ms linear`,
                opacity:      phase === 'dead' ? 0.3 : 1,
                zIndex:       5,
                mixBlendMode: 'multiply',
              }}
            >
              <Image
                src={`/vocations/${slug.charAt(0).toUpperCase() + slug.slice(1)}.${VOCATION_EXT[slug] ?? 'gif'}`}
                alt={character.name}
                width={48}
                height={48}
                unoptimized
                style={{ imageRendering: 'pixelated', display: 'block' }}
              />
            </div>
            {/* Name tag — fora do blend mode para manter legibilidade */}
            <div
              className="absolute pointer-events-none whitespace-nowrap"
              style={{
                left:       `${charPos.x}%`,
                top:        `${charPos.y}%`,
                transform:  'translateX(-50%)',
                transition: `left ${MOVE_TICK_MS}ms linear, top ${MOVE_TICK_MS}ms linear`,
                zIndex:     6,
              }}
            >
              <span className="font-serif text-[9px] text-[#f4e4bc] bg-black/70 px-1 rounded">
                {phase === 'dead' ? '💀' : character.name}
              </span>
            </div>
          </>
        )}

        {/* Monster sprite */}
        {monHp > 0 && (
          <>
            {/* HP bar — sem blend mode */}
            <div
              className="absolute pointer-events-none"
              style={{
                left:      `${monPos.x}%`,
                top:       `calc(${monPos.y}% - 48px - 10px)`,
                transform: 'translateX(-50%)',
                zIndex:    7,
                width:     64,
              }}
            >
              <div className="h-1.5 rounded-full bg-black/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#c0392b] to-[#e74c3c] transition-all"
                  style={{ width: `${(monHp/monDef.hp)*100}%` }}
                />
              </div>
            </div>

            {/* Sprite com blend mode */}
            <div
              className="absolute pointer-events-none"
              style={{
                left:         `${monPos.x}%`,
                top:          `${monPos.y}%`,
                transform:    'translate(-50%, -100%)',
                zIndex:       5,
                mixBlendMode: 'multiply',
              }}
            >
              <Image
                src={`/monsters/${monDef.sprite}.gif`}
                alt={monDef.name}
                width={48}
                height={48}
                unoptimized
                style={{ imageRendering: 'pixelated', display: 'block', transform: 'scaleX(-1)' }}
              />
            </div>

            {/* Name tag — sem blend mode */}
            <div
              className="absolute pointer-events-none whitespace-nowrap"
              style={{
                left:      `${monPos.x}%`,
                top:       `${monPos.y}%`,
                transform: 'translateX(-50%)',
                zIndex:    6,
              }}
            >
              <span className="font-serif text-[9px] text-[#ffaaaa] bg-black/70 px-1 rounded">
                {monDef.name}
              </span>
            </div>
          </>
        )}

        <style jsx>{`
          @keyframes floatUp {
            0%   { transform: translateX(-50%) translateY(0);    opacity: 1; }
            100% { transform: translateX(-50%) translateY(-60px); opacity: 0; }
          }
        `}</style>
      </div>

      {/* ── Combat Log ── */}
      <div className="bg-[#0a0401] border-t border-[#2a1608] px-4 py-2 h-32 overflow-y-auto shrink-0">
        <p className="font-serif text-[9px] text-[#5a3a1a] uppercase tracking-widest mb-1">Log de Combate</p>
        {log.map(e => (
          <p key={e.id} className="font-serif text-[11px] text-[#c8b090]/80 leading-relaxed">{e.text}</p>
        ))}
      </div>
    </main>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcLevel(xp: number, current: number): number {
  let lvl = current
  while (lvl < 1000 && expForLevel(lvl + 1) <= xp) lvl++
  return lvl
}
