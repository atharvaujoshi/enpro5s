
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { ShieldCheck, Mail, Lock, User, LogIn, Loader2, AlertCircle } from 'lucide-react'

export default function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
    role: 'user'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        role: credentials.role,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container-premium">
      <div className="login-box">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '12px', 
            background: '#EEF2FF', 
            borderRadius: '16px', 
            color: '#4F46E5',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={40} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1F2937', marginBottom: '8px' }}>
            ZoneTracker
          </h2>
          <p style={{ color: '#6B7280', fontSize: '1rem' }}>
            Secure Industrial Zone Management
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{ 
              background: '#FEF2F2', 
              border: '1px solid #FECACA', 
              color: '#991B1B', 
              padding: '12px', 
              borderRadius: '8px', 
              marginBottom: '24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '0.875rem'
            }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="email"
                placeholder="name@company.com"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 12px 10px 40px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px', 
                  outline: 'none',
                  fontSize: '0.95rem',
                  transition: 'border-color 0.2s'
                }}
                className="input-focus-ring"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px 12px 10px 40px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px', 
                  outline: 'none',
                  fontSize: '0.95rem',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Select Role
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <select
                value={credentials.role}
                onChange={(e) => setCredentials(prev => ({...prev, role: e.target.value}))}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px 10px 40px', 
                  border: '1px solid #D1D5DB', 
                  borderRadius: '8px', 
                  outline: 'none',
                  fontSize: '0.95rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="user">User</option>
                <option value="zone_manager">Zone Manager</option>
                <option value="ceo">CEO</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '1rem' }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ 
          marginTop: '32px', 
          padding: '20px', 
          background: '#F9FAFB', 
          borderRadius: '12px', 
          border: '1px dashed #D1D5DB' 
        }}>
          <h3 style={{ 
            fontSize: '0.75rem', 
            textTransform: 'uppercase', 
            color: '#6B7280', 
            letterSpacing: '0.05em', 
            fontWeight: '700', 
            marginBottom: '12px' 
          }}>
            Demo Access
          </h3>
          <div style={{ display: 'grid', gap: '8px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>CEO</span>
              <span style={{ fontFamily: 'monospace', background: '#E5E7EB', padding: '2px 6px', borderRadius: '4px' }}>ceo@company.com</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>Manager</span>
              <span style={{ fontFamily: 'monospace', background: '#E5E7EB', padding: '2px 6px', borderRadius: '4px' }}>manager1@company.com</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>User</span>
              <span style={{ fontFamily: 'monospace', background: '#E5E7EB', padding: '2px 6px', borderRadius: '4px' }}>user@company.com</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
            Password: <strong>password</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
