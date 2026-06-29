import { describe, it, expect } from 'vitest'
import { tournaments, getTournament } from './index'
import { roundsCount } from '../lib/bracketMath'

describe('tournament registry', () => {
  it('contains world cup 2026', () => {
    expect(getTournament('worldcup-2026')).toBeDefined()
    expect(getTournament('nope')).toBeUndefined()
  })

  it('each tournament is internally consistent', () => {
    for (const t of tournaments) {
      expect([8, 16, 32]).toContain(t.size)
      expect(t.teams).toHaveLength(t.size)
      expect(t.rounds).toHaveLength(roundsCount(t.size))
      // unique team ids
      expect(new Set(t.teams.map((x) => x.id)).size).toBe(t.size)
    }
  })

  it('world cup 2026 has 32 teams and 5 rounds, Germany first', () => {
    const t = getTournament('worldcup-2026')!
    expect(t.size).toBe(32)
    expect(t.rounds.map((r) => r.zh)).toEqual([
      '1/16决赛', '1/8决赛', '1/4决赛', '半决赛', '决赛',
    ])
    expect(t.teams[0].name.zh).toBe('德国')
    expect(t.teams[31].name.zh).toBe('加纳')
  })
})
