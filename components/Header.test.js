import React from 'react'
import { render, screen } from '@testing-library/react'
import { Header } from './Header'
import { useSession } from 'next-auth/react'

jest.mock('next-auth/react')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  useParams: jest.fn(() => ({})),
}))

describe('Header Component', () => {
  it('renders correctly for unauthenticated user', () => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' })
    render(<Header />)
    expect(screen.getByText('ZoneTracker')).toBeInTheDocument()
  })

  it('renders user info for authenticated worker', () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test Worker', role: 'worker' } },
      status: 'authenticated',
    })
    render(<Header />)
    expect(screen.getByText('Test Worker')).toBeInTheDocument()
    expect(screen.getByText('worker')).toBeInTheDocument()
  })

  it('renders ceo badge for authenticated ceo', () => {
    useSession.mockReturnValue({
      data: { user: { name: 'Test CEO', role: 'ceo' } },
      status: 'authenticated',
    })
    render(<Header />)
    expect(screen.getByText('ceo')).toBeInTheDocument()
  })
})
