import type { Team, Tournament, Picks } from '../types'

export interface Band {
  roundIndex: number
  side: 'upper' | 'lower' | 'center'
  matchIndices: number[]
}

export function roundsCount(size: number): number {
  return Math.log2(size)
}

export function matchesInRound(size: number, roundIndex: number): number {
  return size / 2 ** (roundIndex + 1)
}

export function totalMatches(size: number): number {
  return size - 1
}

export function matchKey(roundIndex: number, matchIndex: number): string {
  return `r${roundIndex}m${matchIndex}`
}

export function getMatchTeams(
  t: Tournament,
  picks: Picks,
  r: number,
  m: number,
): [Team | null, Team | null] {
  const byId = (id: string | undefined): Team | null =>
    id ? t.teams.find((x) => x.id === id) ?? null : null

  if (r === 0) {
    return [t.teams[2 * m] ?? null, t.teams[2 * m + 1] ?? null]
  }
  return [byId(picks[matchKey(r - 1, 2 * m)]), byId(picks[matchKey(r - 1, 2 * m + 1)])]
}

// Remove any pick whose chosen team is no longer a participant of its match.
// Ascending round order makes corrections cascade.
export function prunePicks(t: Tournament, picks: Picks): Picks {
  const rounds = roundsCount(t.size)

  // Step 1: only keep keys that are valid rNmN for this tournament's size.
  const result: Picks = {}
  for (let r = 0; r < rounds; r++) {
    for (let m = 0; m < matchesInRound(t.size, r); m++) {
      const key = matchKey(r, m)
      if (key in picks) result[key] = picks[key]
    }
  }

  // Step 2: validate round-0 picks against seeded teams.
  for (let m = 0; m < matchesInRound(t.size, 0); m++) {
    const key = matchKey(0, m)
    const chosen = result[key]
    if (!chosen) continue
    const seedA = t.teams[2 * m]?.id
    const seedB = t.teams[2 * m + 1]?.id
    if (chosen !== seedA && chosen !== seedB) delete result[key]
  }

  // Step 3: validate rounds >= 1 against current participants (cascade).
  for (let r = 1; r < rounds; r++) {
    for (let m = 0; m < matchesInRound(t.size, r); m++) {
      const key = matchKey(r, m)
      const chosen = result[key]
      if (!chosen) continue
      const [a, b] = getMatchTeams(t, result, r, m)
      const valid = (a && a.id === chosen) || (b && b.id === chosen)
      if (!valid) delete result[key]
    }
  }

  return result
}

export function getChampion(t: Tournament, picks: Picks): Team | null {
  const last = roundsCount(t.size) - 1
  const id = picks[matchKey(last, 0)]
  return id ? t.teams.find((x) => x.id === id) ?? null : null
}

export function getBandLayout(size: number): Band[] {
  const last = roundsCount(size) - 1
  const upper: Band[] = []
  const lower: Band[] = []
  for (let r = 0; r < last; r++) {
    const half = matchesInRound(size, r) / 2
    upper.push({
      roundIndex: r,
      side: 'upper',
      matchIndices: Array.from({ length: half }, (_, i) => i),
    })
    lower.unshift({
      roundIndex: r,
      side: 'lower',
      matchIndices: Array.from({ length: half }, (_, i) => half + i),
    })
  }
  return [...upper, { roundIndex: last, side: 'center', matchIndices: [0] }, ...lower]
}
