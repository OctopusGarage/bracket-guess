import { useTranslation } from 'react-i18next'
import type { Team } from '../types'
import { resolveLang, teamLabel, tr } from '../i18n/lang'

interface Props {
  team: Team | null
  selected: boolean
  onSelect: () => void
  disabled?: boolean
  /** Tight early rounds render smaller, but the name always shows (it wraps). */
  compact?: boolean
}

export default function TeamCell({ team, selected, onSelect, disabled, compact }: Props) {
  const { i18n } = useTranslation()
  const lang = resolveLang(i18n.language)

  if (!team) {
    return <div className="team-cell team-cell--empty" aria-hidden="true" />
  }

  const classes =
    'team-cell' +
    (selected ? ' team-cell--selected' : '') +
    (compact ? ' team-cell--compact' : '')

  return (
    <button
      type="button"
      className={classes}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      title={tr(team.name, lang)}
    >
      <span className="team-cell__flag">{team.flag}</span>
      <span className="team-cell__name">{teamLabel(team, lang)}</span>
    </button>
  )
}
