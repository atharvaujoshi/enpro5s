import React from 'react'
import { render, screen } from '@testing-library/react'
import Dashboard from './Dashboard'
import { useSession } from 'next-auth/react'

jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
}))

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([]),
  })
)

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('renders loading state initially', () => {
    useSession.mockReturnValue({ data: null, status: 'loading' })
    // Dashboard component handles its own loading state for fetching zones, 
    // but the HomePage handles the session loading.
    // Let's assume session is authenticated for Dashboard unit test.
    useSession.mockReturnValue({ data: { user: { name: 'Test User', role: 'ceo' } }, status: 'authenticated' })
    render(<Dashboard />)
    expect(screen.getByText(/Synchronizing Environment/i)).toBeInTheDocument()
  })

  it('renders dashboard content after loading', async () => {
    useSession.mockReturnValue({ data: { user: { name: 'Test User', role: 'ceo' } }, status: 'authenticated' })
    
    // Mock successful zone fetch
    global.fetch.mockImplementationOnce(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ id: 1, status: 'pending', workCount: 0 }])
    }))

    render(<Dashboard />)
    
    // Wait for loading to finish and zones to appear
    const zoneTitle = await screen.findByText(/Zone 1/i)
    expect(zoneTitle).toBeInTheDocument()
    expect(screen.getByText(/Operations Center/i)).toBeInTheDocument()
  })
})
