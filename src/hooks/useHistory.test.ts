import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHistory } from './useHistory'

beforeEach(() => localStorage.clear())

describe('useHistory', () => {
  it('persists and reloads picks per tournament', () => {
    const { result } = renderHook(() => useHistory('wc'))
    act(() => result.current.save({ r0m0: 'a' }))

    const { result: reload } = renderHook(() => useHistory('wc'))
    expect(reload.current.stored).toEqual({ r0m0: 'a' })
  })

  it('keeps tournaments independent', () => {
    const { result: a } = renderHook(() => useHistory('a'))
    act(() => a.current.save({ r0m0: 'x' }))
    const { result: b } = renderHook(() => useHistory('b'))
    expect(b.current.stored).toEqual({})
  })

  it('ignores corrupt storage', () => {
    localStorage.setItem('bracket-guess:wc', '{not json')
    const { result } = renderHook(() => useHistory('wc'))
    expect(result.current.stored).toEqual({})
  })

  it('clear removes stored picks', () => {
    const { result } = renderHook(() => useHistory('wc'))
    act(() => result.current.save({ r0m0: 'a' }))
    act(() => result.current.clear())
    expect(result.current.stored).toEqual({})
  })
})
