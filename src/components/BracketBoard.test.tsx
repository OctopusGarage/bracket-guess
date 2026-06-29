import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '../i18n'
import BracketBoard from './BracketBoard'
import type { Tournament } from '../types'

const T8: Tournament = {
  id: 't8b', title: { zh: '八强', en: 'Eight' }, size: 8,
  rounds: [
    { zh: '1/4', en: 'QF' }, { zh: '半决赛', en: 'SF' }, { zh: '决赛', en: 'F' },
  ],
  teams: ['德', '巴', '法', '瑞', '荷', '摩', '葡', '克'].map((zh, i) => ({
    id: `t${i}`, name: { zh, en: `e${i}` }, flag: '🏳️',
  })),
}

beforeEach(() => localStorage.clear())

// A team advances into multiple bands, so the same name renders more than
// once. Scope every click to its band via the band's data-testid.
const clickIn = (testid: string, text: string) =>
  userEvent.click(within(screen.getByTestId(testid)).getByText(text))

describe('BracketBoard', () => {
  it('renders all first-round teams', () => {
    render(<BracketBoard tournament={T8} />)
    for (const zh of ['德', '巴', '法', '瑞', '荷', '摩', '葡', '克']) {
      expect(screen.getByText(zh)).toBeInTheDocument()
    }
  })

  it('lets the user pick a full path to a champion', async () => {
    // size 8 bands top→bottom: upper-0 (QF m0,m1), upper-1 (SF m0),
    // center (Final m0 + trophy), lower-1 (SF m1), lower-0 (QF m2,m3).
    render(<BracketBoard tournament={T8} />)
    // QF winners
    await clickIn('band-upper-0', '德') // QF m0
    await clickIn('band-upper-0', '法') // QF m1
    await clickIn('band-lower-0', '荷') // QF m2
    await clickIn('band-lower-0', '葡') // QF m3
    // SF winners now populate the round-1 bands
    await clickIn('band-upper-1', '德') // SF upper
    await clickIn('band-lower-1', '荷') // SF lower
    // Final lives in the center band
    await clickIn('band-center', '德')
    // champion shown in center
    expect(screen.getByTestId('champion-name')).toHaveTextContent('德')
  })
})
