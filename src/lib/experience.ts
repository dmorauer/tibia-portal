export function expForLevel(level: number): number {
  if (level <= 1) return 0
  const l = level
  return Math.floor((50 / 3) * (l * l * l - 6 * l * l + 17 * l - 12))
}

export function levelForExp(exp: number): number {
  let lvl = 1
  while (lvl < 1000 && expForLevel(lvl + 1) <= exp) lvl++
  return lvl
}
