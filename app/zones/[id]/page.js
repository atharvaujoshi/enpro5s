'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import moment from 'moment'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Upload, 
  FileImage, 
  CheckSquare, 
  XSquare, 
  History, 
  Trash2, 
  Download,
  Clock,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Bell,
  ChevronRight
} from 'lucide-react'

export default function ZonePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const zoneId = params.id

  const [zoneData, setZoneData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedWorkType, setSelectedWorkType] = useState('WPP')
  const [photoType, setPhotoType] = useState('before')
  const [selectedWorkId, setSelectedWorkId] = useState('')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [approvalComment, setApprovalComment] = useState('')
  const combinedRef = useRef(null)

  useEffect(() => {
    if (session?.user?.role === 'zone_manager') {
      if (session?.user?.assignedZone !== parseInt(zoneId)) {
        router.push('/')
        return
      }
      setPhotoType('after')
    }
    fetchZoneData()
  }, [zoneId, session])

  const fetchZoneData = async () => {
    try {
      const response = await fetch(`/api/zones/${zoneId}`)
      const data = await response.json()
      setZoneData(data)
    } catch (error) {
      setError('Failed to load zone data')
    } finally {
      setLoading(false)
    }
  }

  const pingManager = async (workId) => {
    try {
      const response = await fetch(`/api/work/${workId}/ping`, { method: 'POST' })
      if (response.ok) {
        setSuccess('Manager pinged successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadPhoto = async () => {
    setUploading(true)
    const formData = new FormData()
    formData.append('photo', selectedFile)
    formData.append('zoneId', zoneId)
    formData.append('photoType', photoType)
    formData.append('workType', selectedWorkType)
    if (photoType === 'after') formData.append('workId', selectedWorkId)

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      if (response.ok) {
        setSuccess(`${photoType.toUpperCase()} uploaded!`)
        setShowUploadForm(false)
        fetchZoneData()
      }
    } finally {
      setUploading(false)
    }
  }

  const approveWork = async (workId, approved) => {
    await fetch(`/api/zones/${zoneId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workId, approved, comment: approvalComment })
    })
    fetchZoneData()
  }

  const downloadCombined = async (format) => {
    const canvas = await html2canvas(combinedRef.current, { scale: 2 })
    if (format === 'pdf') {
      const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height])
      pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, canvas.width, canvas.height)
      pdf.save(`zone_${zoneId}.pdf`)
    } else {
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/jpeg')
      link.download = `zone_${zoneId}.${format}`
      link.click()
    }
  }

  if (loading) return <div className="loading">Initializing Secure Session...</div>

  const workRecords = zoneData?.workRecords || []
  const availableWorks = workRecords.filter(w => w.beforePhotos?.length > 0 && w.status !== 'complete' && w.workType === selectedWorkType)

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="glass-header">
        <div className="header-content container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button className="btn btn-secondary" onClick={() => router.push('/')} style={{ padding: '10px' }}>
              <ArrowLeft size={20} />
            </button>
            <div className="brand-logo">
              <ShieldCheck size={32} />
              <span>ZoneTracker</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span className="role-badge">{session?.user?.role}</span>
            <span style={{ fontWeight: '700', color: '#1e293b' }}>{session?.user?.name}</span>
          </div>
        </div>
      </header>

      <main className="main-content container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', marginBottom: '8px' }}>
              <span>Dashboard</span> <ChevronRight size={14} /> <span>Zone {zoneId}</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '900' }}>Inspection Records</h1>
          </div>
          {session?.user?.role !== 'ceo' && (
            <button className="btn btn-primary" onClick={() => setShowUploadForm(!showUploadForm)}>
              <Upload size={20} /> New Record
            </button>
          )}
        </div>

        {showUploadForm && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ padding: '40px', marginBottom: '48px' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="work-type-selector">
                {['WPP', 'WFP', 'FPP'].map(t => <div key={t} className={`type-option ${selectedWorkType === t ? 'selected' : ''}`} onClick={() => setSelectedWorkType(t)}>{t}</div>)}
              </div>
              <div className="photo-type-selector">
                {session?.user?.role !== 'zone_manager' && <button className={`photo-type-btn ${photoType === 'before' ? 'active' : ''}`} onClick={() => setPhotoType('before')}>Before</button>}
                <button className={`photo-type-btn ${photoType === 'after' ? 'active' : ''}`} onClick={() => setPhotoType('after')}>After</button>
              </div>
              {photoType === 'after' && (
                <div className="work-selector" style={{ marginBottom: '24px' }}>
                  <label>Select Active Task</label>
                  <select value={selectedWorkId} onChange={(e) => setSelectedWorkId(e.target.value)}>
                    <option value="">Choose work ID...</option>
                    {availableWorks.map(w => <option key={w._id} value={w._id}>{w.workType} - {w._id.slice(-8).toUpperCase()}</option>)}
                  </select>
                </div>
              )}
              <label htmlFor="p-in" className="file-input-label">
                <FileImage size={48} style={{ color: 'var(--primary)', marginBottom: '16px' }} />
                <strong>Select Inspection Photo</strong>
              </label>
              <input id="p-in" type="file" className="file-input" onChange={handleFileSelect} />
              {previewUrl && (
                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                  <img src={previewUrl} className="preview-img" style={{ marginBottom: '24px' }} />
                  <button className="btn btn-primary" style={{ width: '100%', padding: '16px' }} onClick={uploadPhoto} disabled={uploading}>
                    {uploading ? 'Processing...' : 'Upload to Database'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {workRecords.map((work, idx) => (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={work._id} className="work-record">
            <div className="work-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>{work.workType}</span>
                <span style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '700' }}>#{work._id.slice(-8).toUpperCase()}</span>
                {work.status === 'complete' ? <span className="badge badge-complete">Verified</span> : <span className="badge badge-progress">In Review</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {session?.user?.role === 'ceo' && work.status !== 'complete' && (
                  <button className="btn btn-secondary" onClick={() => pingManager(work._id)} style={{ padding: '8px 16px' }}>
                    <Bell size={16} /> Urgent Ping
                  </button>
                )}
                <div className="badge" style={{ background: moment() > moment(work.deadline) ? '#fee2e2' : '#f1f5f9', color: moment() > moment(work.deadline) ? '#b91c1c' : '#475569', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Clock size={14} /> Due: {moment(work.deadline).format('MMM DD, HH:mm')}
                </div>
              </div>
            </div>

            <div className="work-photos" ref={work.status === 'complete' ? combinedRef : null}>
              <div className="photo-section">
                <h4><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--primary)' }}></div> Initial State (Before)</h4>
                <div className="photo-grid">
                  {work.beforePhotos.map(p => (
                    <div key={p._id} className="photo-card">
                      <img src={p.url} />
                      <div className="photo-overlay">{moment(p.timestamp).format('DD MMM YYYY, HH:mm')}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="photo-section">
                <h4><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }}></div> Final Result (After)</h4>
                <div className="photo-grid">
                  {work.afterPhotos.length > 0 ? work.afterPhotos.map(p => (
                    <div key={p._id} className="photo-card">
                      <img src={p.url} />
                      <div className="photo-overlay">{moment(p.timestamp).format('DD MMM YYYY, HH:mm')}</div>
                    </div>
                  )) : <div style={{ height: '200px', borderRadius: '20px', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Awaiting Evidence</div>}
                </div>
              </div>
            </div>

            {session?.user?.role === 'ceo' && work.status === 'inprogress' && (
              <div style={{ marginTop: '40px', padding: '32px', background: '#f8fafc', borderRadius: '24px' }}>
                <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={20} /> CEO Verification</h4>
                <textarea placeholder="Approval notes..." value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} style={{ width: '100%', height: '100px', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', outline: 'none' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button className="btn btn-primary" onClick={() => approveWork(work._id, true)} style={{ flex: 1, background: 'var(--success)' }}><CheckSquare size={20} /> Approve</button>
                  <button className="btn btn-primary" onClick={() => approveWork(work._id, false)} style={{ flex: 1, background: 'var(--danger)' }}><XSquare size={20} /> Reject</button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </main>
    </div>
  )
}
