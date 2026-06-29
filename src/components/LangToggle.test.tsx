import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import i18n from '../i18n'
import LangToggle from './LangToggle'

describe('LangToggle', () => {
  it('switches between the four languages', async () => {
    await i18n.changeLanguage('zh')
    render(<LangToggle />)
    await userEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(i18n.language).toBe('en')
    await userEvent.click(screen.getByRole('button', { name: 'ES' }))
    expect(i18n.language).toBe('es')
    await userEvent.click(screen.getByRole('button', { name: '日' }))
    expect(i18n.language).toBe('ja')
  })
})
