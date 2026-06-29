import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import '../i18n'
import ShareBar from './ShareBar'

vi.mock('html2canvas', () => ({
  default: vi.fn().mockResolvedValue({
    toDataURL: () => 'data:image/png;base64,poster',
    toBlob: (cb: (b: Blob) => void) => cb(new Blob(['x'], { type: 'image/png' })),
  }),
}))

describe('ShareBar', () => {
  it('disables export until complete and shows remaining', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ShareBar targetRef={ref} disabled remaining={3} onReset={() => {}} />)
    expect(screen.getByRole('button', { name: /保存海报|Save poster/ })).toBeDisabled()
    expect(screen.getByText(/3/)).toBeInTheDocument()
  })

  it('enables export when complete', () => {
    const ref = createRef<HTMLDivElement>()
    render(<ShareBar targetRef={ref} disabled={false} remaining={0} onReset={() => {}} />)
    expect(screen.getByRole('button', { name: /保存海报|Save poster/ })).toBeEnabled()
  })

  it('opens a save sheet with the poster image and a save action', async () => {
    const ref = { current: document.createElement('div') }
    render(<ShareBar targetRef={ref} disabled={false} remaining={0} onReset={() => {}} />)
    await userEvent.click(screen.getByRole('button', { name: /保存海报|Save poster/ }))
    const img = await screen.findByRole('img')
    expect(img.getAttribute('src')).toContain('data:image/png')
    expect(screen.getByRole('button', { name: /保存到相册|Save to Photos/ })).toBeInTheDocument()
  })
})
