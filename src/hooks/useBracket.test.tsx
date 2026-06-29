import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useBracket } from './useBracket'
import type { Tournament } from '../types'

const T8: Tournament = {
  id: 't8', title: { zh: '八强', en: 'Eight' }, size: 8,
  rounds: [
    { zh: '1/4', en: 'QF' }, { zh: '半决赛', en: 'SF' }, { zh: '决赛', en: 'F' },
  ],
  teams: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => ({
    id, name: { zh: id, en: id }, flag: '🏳️',
  })),
}

beforeEach(() => localStorage.clear())

describe('useBracket', () => {
  it('advances a winner into the next round', () => {
    const { result } = renderHook(() => useBracket(T8))
    act(() => result.current.pick(0, 0, 'a'))
    expect(result.current.matchTeams(1, 0)[0]?.id).toBe('a')
  })

  it('clears downstream picks when an earlier pick changes', () => {
    const { result } = renderHook(() => useBracket(T8))
    act(() => {
      result.current.pick(0, 0, 'a')
      result.current.pick(0, 1, 'c')
      result.current.pick(1, 0, 'a')
    })
    expect(result.current.champion).toBeNull()
    act(() => result.current.pick(0, 0, 'b')) // invalidates r1m0 = 'a'
    expect(result.current.matchTeams(1, 0)[0]?.id).toBe('b')
    // r1m0 pick was cleared
    expect(result.current.picks['r1m0']).toBeUndefined()
  })

  it('reports completion and champion when fully filled', () => {
    const { result } = renderHook(() => useBracket(T8))
    act(() => {
      result.current.pick(0, 0, 'a')
      result.current.pick(0, 1, 'c')
      result.current.pick(0, 2, 'e')
      result.current.pick(0, 3, 'g')
      result.current.pick(1, 0, 'a')
      result.current.pick(1, 1, 'e')
      result.current.pick(2, 0, 'a')
    })
    expect(result.current.isComplete).toBe(true)
    expect(result.current.remaining).toBe(0)
    expect(result.current.champion?.id).toBe('a')
  })

  it('restores picks from storage', () => {
    localStorage.setItem('bracket-guess:t8', JSON.stringify({ r0m0: 'a' }))
    const { result } = renderHook(() => useBracket(T8))
    expect(result.current.matchTeams(1, 0)[0]?.id).toBe('a')
  })

  it('reset clears everything', () => {
    const { result } = renderHook(() => useBracket(T8))
    act(() => result.current.pick(0, 0, 'a'))
    act(() => result.current.reset())
    expect(result.current.picks).toEqual({})
  })
})
