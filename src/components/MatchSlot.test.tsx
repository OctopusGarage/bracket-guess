import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '../i18n'
import MatchSlot from './MatchSlot'
import type { Team } from '../types'

const a: Team = { id: 'a', name: { zh: '德国', en: 'Germany' }, flag: '🇩🇪' }
const b: Team = { id: 'b', name: { zh: '巴西', en: 'Brazil' }, flag: '🇧🇷' }

describe('MatchSlot', () => {
  it('renders both teams and reports a pick', async () => {
    const onPick = vi.fn()
    render(<MatchSlot teams={[a, b]} onPick={onPick} />)
    expect(screen.getByText('德国')).toBeInTheDocument()
    await userEvent.click(screen.getByText('巴西'))
    expect(onPick).toHaveBeenCalledWith('b')
  })

  it('marks the winner selected', () => {
    render(<MatchSlot teams={[a, b]} winnerId="a" onPick={() => {}} />)
    expect(screen.getByText('德国').closest('.team-cell'))
      .toHaveClass('team-cell--selected')
  })

  it('does not pick an empty slot', async () => {
    const onPick = vi.fn()
    render(<MatchSlot teams={[a, null]} onPick={onPick} />)
    const empties = document.querySelectorAll('.team-cell--empty')
    expect(empties).toHaveLength(1)
    await userEvent.click(empties[0] as Element)
    expect(onPick).not.toHaveBeenCalled()
  })
})
