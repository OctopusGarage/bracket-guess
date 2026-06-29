import type { Team } from '../types'
import TeamCell from './TeamCell'

interface Props {
  teams: [Team | null, Team | null]
  winnerId?: string
  onPick: (teamId: string) => void
  compact?: boolean
}

export default function MatchSlot({ teams, winnerId, onPick, compact }: Props) {
  return (
    <div className="match-slot">
      {teams.map((team, i) => (
        <TeamCell
          key={team?.id ?? `empty-${i}`}
          team={team}
          selected={!!team && team.id === winnerId}
          onSelect={() => team && onPick(team.id)}
          compact={compact}
        />
      ))}
    </div>
  )
}
