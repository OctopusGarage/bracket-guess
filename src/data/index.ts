import type { Tournament } from '../types'
import worldcup2026 from './tournaments/worldcup-2026.json'

export const tournaments: Tournament[] = [worldcup2026 as Tournament]

export function getTournament(id: string): Tournament | undefined {
  return tournaments.find((t) => t.id === id)
}
