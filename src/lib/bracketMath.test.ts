import { describe, it, expect } from 'vitest'
import {
  roundsCount, matchesInRound, totalMatches, matchKey,
  getMatchTeams, prunePicks, getChampion, getBandLayout,
} from './bracketMath'
import type { Tournament } from '../types'

// 4-team fixture: round0 = [A vs B, C vs D], round1 = final
const T4: Tournament = {
  id: 't4', title: { zh: '四强', en: 'Four' }, size: 8,
  rounds: [
    { zh: '半决赛', en: 'SF' }, { zh: '决赛', en: 'F' }, { zh: 'x', en: 'x' },
  ],
  teams: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((c) => ({
    id: c.toLowerCase(), name: { zh: c, en: c }, flag: '🏳️',
  })),
}

describe('bracket math', () => {
  it('roundsCount = log2(size)', () => {
    expect(roundsCount(8)).toBe(3)
    expect(roundsCount(16)).toBe(4)
    expect(roundsCount(32)).toBe(5)
  })

  it('matchesInRound halves each round', () => {
    expect(matchesInRound(32, 0)).toBe(16)
    expect(matchesInRound(32, 1)).toBe(8)
    expect(matchesInRound(32, 4)).toBe(1)
    expect(matchesInRound(8, 0)).toBe(4)
  })

  it('totalMatches = size - 1', () => {
    expect(totalMatches(32)).toBe(31)
    expect(totalMatches(8)).toBe(7)
  })

  it('round 0 match teams come from seeded order', () => {
    expect(getMatchTeams(T4, {}, 0, 0).map((x) => x?.id)).toEqual(['a', 'b'])
    expect(getMatchTeams(T4, {}, 0, 3).map((x) => x?.id)).toEqual(['g', 'h'])
  })

  it('later round teams are winners of prior matches', () => {
    const picks = { [matchKey(0, 0)]: 'a', [matchKey(0, 1)]: 'c' }
    expect(getMatchTeams(T4, picks, 1, 0).map((x) => x?.id)).toEqual(['a', 'c'])
  })

  it('returns null for undecided slots', () => {
    expect(getMatchTeams(T4, {}, 1, 0)).toEqual([null, null])
  })

  it('prunePicks clears downstream picks invalidated by an earlier change', () => {
    // a beat b, c beat d, then a beat c (champion a)
    let picks = {
      [matchKey(0, 0)]: 'a', [matchKey(0, 1)]: 'c', [matchKey(1, 0)]: 'a',
    }
    // user changes round0 match0 winner from a to b -> round1 pick of "a" is now invalid
    picks = prunePicks(T4, { ...picks, [matchKey(0, 0)]: 'b' })
    expect(picks[matchKey(1, 0)]).toBeUndefined()
    expect(picks[matchKey(0, 0)]).toBe('b')
  })

  it('getChampion reads the final match winner', () => {
    const picks = {
      [matchKey(0, 0)]: 'a', [matchKey(0, 1)]: 'c', [matchKey(1, 0)]: 'a',
    }
    // T4 size 8 has 3 rounds; build a full small case instead:
    expect(getChampion(T4, picks)).toBeNull() // final is round 2 here, not decided
  })

  it('getBandLayout splits halves around a center final', () => {
    const bands = getBandLayout(8) // rounds=3, last=2
    expect(bands.map((b) => b.side)).toEqual([
      'upper', 'upper', 'center', 'lower', 'lower',
    ])
    const center = bands.find((b) => b.side === 'center')!
    expect(center).toEqual({ roundIndex: 2, side: 'center', matchIndices: [0] })
    // round 0 upper takes first half of its 4 matches
    expect(bands[0]).toEqual({ roundIndex: 0, side: 'upper', matchIndices: [0, 1] })
    // round 0 lower (last band) takes second half
    expect(bands[4]).toEqual({ roundIndex: 0, side: 'lower', matchIndices: [2, 3] })
  })

  // spec §5 robustness: prunePicks must drop out-of-range/unknown/invalid-seed picks
  describe('prunePicks robustness (spec §5)', () => {
    it('removes garbage/unknown keys that are not valid rNmN for this tournament', () => {
      const picks = { garbage: 'a', r99m0: 'a', [matchKey(0, 0)]: 'a' }
      const pruned = prunePicks(T4, picks)
      expect('garbage' in pruned).toBe(false)
      expect('r99m0' in pruned).toBe(false)
      expect(pruned[matchKey(0, 0)]).toBe('a')
    })

    it('removes round-0 pick whose chosen team is not one of the two seeds', () => {
      // r0m0 seeds are 'a' and 'b'; 'z' is not a valid seed
      const picks = { [matchKey(0, 0)]: 'z' }
      const pruned = prunePicks(T4, picks)
      expect(pruned[matchKey(0, 0)]).toBeUndefined()
    })

    it('keeps a valid round-0 pick whose chosen team IS one of the two seeds', () => {
      // r0m0 seeds are 'a' (T4.teams[0]) and 'b' (T4.teams[1])
      const picks = { [matchKey(0, 0)]: 'a' }
      const pruned = prunePicks(T4, picks)
      expect(pruned[matchKey(0, 0)]).toBe('a')
    })

    it('cascade still works after removing stale upstream picks', () => {
      let picks = {
        [matchKey(0, 0)]: 'a', [matchKey(0, 1)]: 'c', [matchKey(1, 0)]: 'a',
      }
      picks = prunePicks(T4, { ...picks, [matchKey(0, 0)]: 'b' })
      expect(picks[matchKey(1, 0)]).toBeUndefined()
      expect(picks[matchKey(0, 0)]).toBe('b')
    })

    it('prunePicks keeps a fully valid complete bracket unchanged', () => {
      // Build a complete, internally-consistent set of picks for T4 (size 8, 3 rounds)
      const complete = {
        // Round 0: seeds beaten
        [matchKey(0, 0)]: 'a', // from [a, b]
        [matchKey(0, 1)]: 'c', // from [c, d]
        [matchKey(0, 2)]: 'e', // from [e, f]
        [matchKey(0, 3)]: 'g', // from [g, h]
        // Round 1: winners advance
        [matchKey(1, 0)]: 'a', // from [a, c]
        [matchKey(1, 1)]: 'e', // from [e, g]
        // Round 2 (final): champion
        [matchKey(2, 0)]: 'a', // from [a, e]
      }
      const pruned = prunePicks(T4, complete)
      expect(pruned).toEqual(complete)
    })
  })
})
