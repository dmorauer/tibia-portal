'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

type NavItem = { label: string; href: string }
type NavSection = { title: string; items: NavItem[] }

const NAV: NavSection[] = [
  {
    title: 'Teleportes',
    items: [
      { label: 'Cidade',         href: '/cidade' },
      { label: 'Treino online',  href: '/treino/online' },
      { label: 'Treino offline', href: '/treino/offline' },
      { label: 'Hunts',          href: '/hunt' },
      { label: 'Hunt offline',   href: '/hunt/offline' },
      { label: 'Chefes',         href: '/chefes' },
    ],
  },
]

export function GameNav({ characterName }: { characterName: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={ref} className="relative z-50">
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-sm border border-[#3a2410] bg-[#1a0a05] hover:bg-[#2a1208] transition"
      >
        <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
          <rect y="0" width="14" height="2" fill="#f0c84a" />
          <rect y="5" width="14" height="2" fill="#f0c84a" />
          <rect y="10" width="14" height="2" fill="#f0c84a" />
        </svg>
        <span className="font-serif text-sm font-bold text-[#f0c84a] tracking-wide capitalize">
          {characterName}
        </span>
        <svg
          width="8" height="8" viewBox="0 0 8 8" fill="none"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M1 2l3 4 3-4" stroke="#8b6b3a" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-52 border border-[#3a2410] shadow-2xl"
          style={{ background: '#140804' }}
        >
          {NAV.map((section) => (
            <div key={section.title}>
              <div className="px-4 py-2 border-b border-[#3a2410]">
                <span className="font-serif text-xs font-bold tracking-widest uppercase text-[#8b6b3a]">
                  {section.title}
                </span>
              </div>
              {section.items.map((item) => {
                const active = pathname === item.href
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-0 group transition"
                    style={{
                      background: active ? '#2a1208' : 'transparent',
                      borderLeft: active ? '3px solid #f0c84a' : '3px solid transparent',
                    }}
                  >
                    <span
                      className="flex-1 px-4 py-2.5 font-serif text-sm transition"
                      style={{ color: active ? '#f0c84a' : '#d4b896' }}
                    >
                      {item.label}
                    </span>
                  </a>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
