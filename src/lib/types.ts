export type Vocation = {
  id: number
  name: string
  slug: string
  promoted_from_id: number | null
}

export type Build = {
  id: string
  owner_id: string
  vocation_id: number
  name: string
  level: number
  skills: Record<string, number>
  is_public: boolean
  created_at: string
  updated_at: string
}

export type IdleCharacter = {
  id: string
  owner_id: string
  vocation_id: number
  gender: 'male' | 'female'
  name: string
  level: number
  experience: number
  gold: number
  stats: Record<string, number>
  inventory: unknown[]
  last_tick_at: string
  created_at: string
}