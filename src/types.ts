import type { Localized } from './i18n/lang'

export interface Team {
  id: string
  name: Localized
  /** Broadcast short name for space-constrained cells; falls back to name. */
  short?: Localized
  flag: string
  color?: string
}

export interface Tournament {
  id: string
  title: Localized
  size: 8 | 16 | 32
  rounds: Localized[]
  teams: Team[]
  qrUrl?: string
  theme?: { primary?: string; bg?: string }
}

export type Picks = Record<string, string>
