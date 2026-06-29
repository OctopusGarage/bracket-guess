import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import QrCode from './QrCode'

vi.mock('qrcode', () => ({
  default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,qr') },
}))

describe('QrCode', () => {
  it('renders an image encoding the given url', async () => {
    render(<QrCode url="https://octopusgarage.github.io/bracket-guess/" />)
    expect(await screen.findByAltText('qr')).toBeInTheDocument()
  })
})
