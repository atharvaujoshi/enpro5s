
'use client'

import { useSession } from 'next-auth/react'
import Login from '../components/Login'
import Dashboard from '../components/Dashboard'

export default function HomePage() {
  const { status } = useSession()

  if (status === 'loading') {
    return <div className="loading">Loading session...</div>
  }

  if (status === 'unauthenticated') {
    return <Login />
  }

  return <Dashboard />
}
