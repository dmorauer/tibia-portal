export type VocationCfg = {
  baseHp: number
  baseMana: number
  hpPerLevel: number
  manaPerLevel: number
  skills: string[]
}

// IDs: 1=Knight, 2=Paladin, 3=Sorcerer, 4=Druid, 5=Monk
export const VOCATION_CONFIG: Record<number, VocationCfg> = {
  1: { baseHp: 145, baseMana: 35,  hpPerLevel: 15, manaPerLevel: 5,  skills: ['melee', 'shield', 'magic_level'] },
  2: { baseHp: 145, baseMana: 60,  hpPerLevel: 10, manaPerLevel: 15, skills: ['distance', 'shield', 'magic_level'] },
  3: { baseHp: 145, baseMana: 60,  hpPerLevel: 5,  manaPerLevel: 30, skills: ['magic_level'] },
  4: { baseHp: 145, baseMana: 60,  hpPerLevel: 5,  manaPerLevel: 30, skills: ['magic_level'] },
  5: { baseHp: 145, baseMana: 45,  hpPerLevel: 12, manaPerLevel: 8,  skills: ['melee', 'magic_level'] },
}

export function calcInitialStats(vocationId: number): Record<string, number> {
  const cfg = VOCATION_CONFIG[vocationId]
  if (!cfg) return {}
  return {
    hp: cfg.baseHp,
    max_hp: cfg.baseHp,
    mana: cfg.baseMana,
    max_mana: cfg.baseMana,
    ...Object.fromEntries(cfg.skills.map(s => [s, 10])),
  }
}
