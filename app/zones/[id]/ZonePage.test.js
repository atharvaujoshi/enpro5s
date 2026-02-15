import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import ZonePage from './page'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'

jest.mock('next-auth/react')
jest.mock('html2canvas', () => jest.fn())
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    addImage: jest.fn(),
    save: jest.fn(),
  }))
})
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useParams: jest.fn(() => ({ id: '1' })),
}))

// Mock fetch
global.fetch = jest.fn()

describe('ZonePage Component', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    useParams.mockReturnValue({ id: '1' })
    useSession.mockReturnValue({
      data: { user: { name: 'Test Worker', role: 'worker' } },
      status: 'authenticated',
    })
  })

  it('renders loading state initially', () => {
    // Return a promise that doesn't resolve immediately
    global.fetch.mockReturnValue(new Promise(() => {}))
    render(<ZonePage />)
    expect(screen.getByText(/Initializing Secure Inspection Session/i)).toBeInTheDocument()
  })

  it('renders zone details after loading', async () => {
    const mockZoneData = {
      id: 1,
      name: 'Zone 1',
      workRecords: [
        {
          _id: 'work123',
          workType: 'WPP',
          status: 'inprogress',
          deadline: new Date().toISOString(),
          beforePhotos: [{ _id: 'p1', url: '/uploads/test.jpg', timestamp: new Date().toISOString() }],
          afterPhotos: []
        }
      ]
    }

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockZoneData)
    })

    render(<ZonePage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Zone 1/i)).toBeInTheDocument()
      expect(screen.getByText(/WPP/i)).toBeInTheDocument()
      expect(screen.getByText(/#WORK123/i)).toBeInTheDocument()
    })
  })

  it('handles fetch error gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500
    })

    render(<ZonePage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to load zone data/i)).toBeInTheDocument()
    })
  })
})
