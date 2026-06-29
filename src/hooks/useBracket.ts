import { useCallback, useMemo, useRef } from 'react'
import type { Team, Tournament } from '../types'
import {
  matchKey, getMatchTeams, prunePicks, getChampion, totalMatches,
} from '../lib/bracketMath'
import { useHistory } from './useHistory'

export function useBracket(tournament: Tournament) {
  const { stored, save, clear } = useHistory(tournament.id)

  // Always store a pruned view so corrupt/foreign picks can't leak in.
  const picks = useMemo(() => prunePicks(tournament, stored), [tournament, stored])

  // Ref for synchronous access so multiple picks within one act() accumulate correctly.
  const picksRef = useRef(picks)
  picksRef.current = picks

  const pick = useCallback(
    (roundIndex: number, matchIndex: number, teamId: string) => {
      const next = prunePicks(tournament, {
        ...picksRef.current,
        [matchKey(roundIndex, matchIndex)]: teamId,
      })
      picksRef.current = next
      save(next)
    },
    [tournament, save],
  )

  const matchTeams = useCallback(
    (roundIndex: number, matchIndex: number): [Team | null, Team | null] =>
      getMatchTeams(tournament, picks, roundIndex, matchIndex),
    [tournament, picks],
  )

  const champion = useMemo(() => getChampion(tournament, picks), [tournament, picks])
  const remaining = totalMatches(tournament.size) - Object.keys(picks).length
  const isComplete = remaining === 0

  return { picks, pick, matchTeams, champion, isComplete, remaining, reset: clear }
}
