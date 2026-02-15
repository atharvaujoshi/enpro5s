import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Login from './Login'
import { signIn } from 'next-auth/react'

// Mock components that might be problematic in JSDOM
jest.mock('next-auth/react')

// Mock Select component because it uses Radix which is hard to test in unit tests without proper setup
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} aria-label="Select Role">
      {children}
    </select>
  ),
  SelectContent: ({ children }) => <>{children}</>,
  SelectItem: ({ children, value }) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }) => <>{children}</>,
  SelectValue: ({ placeholder }) => <>{placeholder}</>,
}))

describe('Login Component', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('renders correctly', () => {
    render(<Login />)
    expect(screen.getByText('ZoneTracker')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    // Using getAllByText because "Sign In" might be in the button and elsewhere
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument()
  })

  it('handles role selection', () => {
    render(<Login />)
    const select = screen.getByLabelText(/Select Role/i)
    fireEvent.change(select, { target: { value: 'ceo' } })
    expect(select.value).toBe('ceo')
  })

  it('submits correctly', async () => {
    signIn.mockResolvedValue({ error: null })
    render(<Login />)
    
    fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }))

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
        email: 'test@example.com',
        password: 'password',
      }))
    })
  })
})
