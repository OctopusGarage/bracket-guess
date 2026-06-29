import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import '../i18n'
import HomeView from './HomeView'
import PredictView from './PredictView'

function renderAt(path: string) {
  const router = createMemoryRouter(
    [
      { path: '/', element: <HomeView /> },
      { path: '/predict/:tournamentId', element: <PredictView /> },
    ],
    { initialEntries: [path] },
  )
  return render(<RouterProvider router={router} />)
}

beforeEach(() => localStorage.clear())

describe('routing', () => {
  it('home lists the world cup', () => {
    renderAt('/')
    expect(screen.getByText(/世界杯 2026/)).toBeInTheDocument()
  })

  it('predict view renders the board for a valid id', () => {
    renderAt('/predict/worldcup-2026')
    expect(screen.getByTestId('band-center')).toBeInTheDocument()
    expect(screen.getByText('德国')).toBeInTheDocument()
  })

  it('invalid id redirects home', () => {
    renderAt('/predict/nope')
    expect(screen.getByText(/选择赛事/)).toBeInTheDocument()
  })
})
