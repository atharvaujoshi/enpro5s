
'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  LogOut, 
  Building, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  FileText 
} from 'lucide-react'

export default function Dashboard() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState('unsolved')
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchZones()
    if (session?.user?.role === 'ceo') {
      fetchReport()
    }
  }, [activeTab, session])

  const fetchReport = async () => {
    try {
      const response = await fetch('/api/report')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    }
  }

  const fetchZones = async () => {
    try {
      const response = await fetch(`/api/zones?status=${activeTab}`)
      const data = await response.json()
      setZones(data)
    } catch (error) {
      console.error('Error fetching zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete': return <span className="badge badge-complete">Completed</span>
      case 'rejected': return <span className="badge badge-rejected">Rejected</span>
      case 'inprogress': return <span className="badge badge-progress">In Progress</span>
      default: return <span className="badge badge-pending">Pending</span>
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="glass-header">
        <div className="header-content">
          <div className="brand-logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={32} />
            <span>ZoneTracker</span>
          </div>
          <div className="user-info">
            <span className="role-badge" style={{ background: '#EEF2FF', color: 'var(--primary)', padding: '6px 12px' }}>{session?.user?.role}</span>
            {session?.user?.assignedZone && (
              <span className="badge badge-progress">Zone {session.user.assignedZone}</span>
            )}
            <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)', margin: '0 8px' }}></div>
            <button className="btn btn-secondary" onClick={() => signOut()} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="main-content container">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ marginBottom: '56px', textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '12px', background: 'linear-gradient(to right, #1e293b, #4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Operations Center
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
            Welcome back, <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{session?.user?.name || 'Authorized Personnel'}</span>.
          </p>
        </motion.div>

        {session?.user?.role === 'ceo' && stats && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{ marginBottom: '64px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></div>
                Global Project Status
              </h2>
              <button className="btn btn-secondary" disabled style={{ opacity: 0.6 }}>
                <FileText size={18} />
                Excel Report (Locked)
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
              {Object.entries(stats).map(([type, counts]) => (
                <motion.div key={type} variants={itemVariants} className="glass-card" style={{ padding: '32px', borderTop: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ padding: '12px', borderRadius: '16px', background: '#EEF2FF', color: 'var(--primary)' }}>
                      <Building size={28} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800' }}>{type}</h3>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protocol Units</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#FFFBEB', borderRadius: '20px', border: '1px solid #FEF3C7' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#92400E' }}>{counts.pending}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#B45309', opacity: 0.8 }}>OPEN</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#F0FDF4', borderRadius: '20px', border: '1px solid #DCFCE7' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#166534' }}>{counts.completed}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#15803D', opacity: 0.8 }}>DONE</div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '16px', background: '#FEF2F2', borderRadius: '20px', border: '1px solid #FEE2E2' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: '900', color: '#991B1B' }}>{counts.rejected}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: '700', color: '#B91C1C', opacity: 0.8 }}>FAILED</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></div>
              Managed Zones
            </h2>
            <div style={{ background: 'rgba(0,0,0,0.05)', padding: '6px', borderRadius: '16px', display: 'inline-flex', gap: '4px' }}>
              <button 
                className={`tab ${activeTab === 'unsolved' ? 'active' : ''}`}
                onClick={() => setActiveTab('unsolved')}
                style={{ padding: '10px 20px' }}
              >
                <AlertCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Unsolved
              </button>
              <button 
                className={`tab ${activeTab === 'complete' ? 'active' : ''}`}
                onClick={() => setActiveTab('complete')}
                style={{ padding: '10px 20px' }}
              >
                <CheckCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Completed
              </button>
              <button 
                className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
                onClick={() => setActiveTab('rejected')}
                style={{ padding: '10px 20px' }}
              >
                <XCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Rejected
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
              <div className="btn-loader" style={{ margin: '0 auto 24px', borderColor: '#cbd5e1', borderTopColor: 'var(--primary)', width: '40px', height: '40px' }}></div>
              <p style={{ fontWeight: '600' }}>Synchronizing Zone Data...</p>
            </div>
          ) : (
            <motion.div 
              className="dashboard-grid"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {zones.map((zone) => (
                <Link key={zone.id} href={`/zones/${zone.id}`} style={{ textDecoration: 'none' }}>
                  <motion.div 
                    variants={itemVariants} 
                    whileHover={{ scale: 1.02, translateY: -5 }}
                    className="glass-card" 
                    style={{ padding: '0', height: '100%' }}
                  >
                    <div style={{ padding: '32px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
                        <div style={{ padding: '12px', background: '#F1F5F9', borderRadius: '12px', color: '#475569' }}>
                          <MapPin size={24} />
                        </div>
                        {getStatusBadge(zone.status)}
                      </div>
                      <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: '0 0 4px 0' }}>Zone {zone.id}</h3>
                      <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Main Industrial Sector</p>
                    </div>
                    
                    <div style={{ padding: '24px 32px', background: 'rgba(248, 250, 252, 0.4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Active Tasks</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1E293B' }}>{zone.workCount || 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>Last Action</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={14} />
                          {zone.lastUpdated || 'None'}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          )}

          {!loading && zones.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: 'center', padding: '100px 40px', background: 'rgba(255,255,255,0.3)', borderRadius: '32px', border: '2px dashed rgba(0,0,0,0.1)' }}
            >
              <div style={{ background: '#F1F5F9', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#94A3B8' }}>
                <LayoutDashboard size={40} />
              </div>
              <h3 style={{ color: '#1e293b', marginBottom: '8px', fontWeight: '800' }}>Clear Environment</h3>
              <p style={{ color: '#64748b' }}>No zones require attention in this category.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
