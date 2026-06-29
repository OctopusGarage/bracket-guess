import { useCallback, useState } from 'react'
import type { Picks } from '../types'

const keyFor = (id: string) => `bracket-guess:${id}`

function read(id: string): Picks {
  try {
    const raw = localStorage.getItem(keyFor(id))
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Picks) : {}
  } catch {
    return {}
  }
}

export function useHistory(tournamentId: string) {
  const [stored, setStored] = useState<Picks>(() => read(tournamentId))

  const save = useCallback(
    (p: Picks) => {
      localStorage.setItem(keyFor(tournamentId), JSON.stringify(p))
      setStored(p)
    },
    [tournamentId],
  )

  const clear = useCallback(() => {
    localStorage.removeItem(keyFor(tournamentId))
    setStored({})
  }, [tournamentId])

  return { stored, save, clear }
}
