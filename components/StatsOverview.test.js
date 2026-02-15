import React from 'react'
import { render, screen } from '@testing-library/react'
import { StatsOverview } from './StatsOverview'

// Mock Recharts because it uses SVG and is hard to test in JSDOM
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  Legend: () => <div />,
  Cell: () => <div />,
}))

describe('StatsOverview Component', () => {
  const mockStats = {
    WPP: { pending: 5, completed: 10, rejected: 2 },
    FPP: { pending: 2, completed: 15, rejected: 1 },
    WFP: { pending: 8, completed: 5, rejected: 0 },
  }

  it('renders stats cards correctly', () => {
    render(<StatsOverview stats={mockStats} />)
    expect(screen.getByText('WPP')).toBeInTheDocument()
    expect(screen.getByText('FPP')).toBeInTheDocument()
    expect(screen.getByText('WFP')).toBeInTheDocument()
  })

  it('displays correct counts', () => {
    render(<StatsOverview stats={mockStats} />)
    expect(screen.getByText('10')).toBeInTheDocument() // WPP completed
    expect(screen.getByText('15')).toBeInTheDocument() // FPP completed
  })
})
