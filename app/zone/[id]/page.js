
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import moment from 'moment'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function ZonePage() {
  const params = useParams()
  const router = useRouter()
  const zoneId = params.id

  const [zoneData, setZoneData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const combinedRef = useRef(null)

  useEffect(() => { 
    fetchZoneData() 
  }, [zoneId])

  const fetchZoneData = async () => {
    try {
      const response = await fetch(`/api/zones/${zoneId}`)
      const data = await response.json()
      setZoneData(data)
      setLoading(false)
    } catch (error) {
      setError('Failed to load zone data')
      setLoading(false)
    }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError('File size must be less than 10MB')
          return
        }
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
        setError('')
      } else {
        setError('Please select a valid image file (JPG, PNG, etc.)')
      }
    }
  }

  const uploadPhoto = async (photoType) => {
    if (!selectedFile) {
      setError('Please select a photo first')
      return
    }
    setUploading(true)
    setError('')
    setSuccess('')

    const formData = new FormData()
    formData.append('photo', selectedFile)
    formData.append('zoneId', zoneId)
    formData.append('photoType', photoType)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const result = await response.json()

      if (response.ok) {
        setSuccess(`${photoType.charAt(0).toUpperCase() + photoType.slice(1)} photo uploaded successfully!`)
        setSelectedFile(null)
        setPreviewUrl(null)
        fetchZoneData() // Refresh zone data
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (error) {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const calculateTimeDifference = () => {
    if (zoneData?.beforePhoto?.timestamp && zoneData?.afterPhoto?.timestamp) {
      const before = moment(zoneData.beforePhoto.timestamp)
      const after = moment(zoneData.afterPhoto.timestamp)
      const duration = moment.duration(after.diff(before))

      const days = Math.floor(duration.asDays())
      const hours = duration.hours()
      const minutes = duration.minutes()

      let result = []
      if (days > 0) result.push(`${days}d`)
      if (hours > 0) result.push(`${hours}h`)
      if (minutes > 0) result.push(`${minutes}m`)

      return result.length > 0 ? result.join(' ') : 'Less than 1 minute'
    }
    return null
  }

  const canUploadBefore = !zoneData?.beforePhoto
  const canUploadAfter = zoneData?.beforePhoto && !zoneData?.afterPhoto
  const isComplete = zoneData?.beforePhoto && zoneData?.afterPhoto
  const timeDifference = calculateTimeDifference()

  // Reset zone manually
  const resetZone = async () => {
    try {
      const response = await fetch(`/api/zones/${zoneId}/reset`, { method: "POST" })
      if (response.ok) {
        setSuccess('Zone reset successfully! Ready for new documentation.')
        fetchZoneData()
      } else {
        setError('Failed to reset zone. Please try again.')
      }
    } catch (error) {
      setError('Failed to reset zone. Please check your connection.')
    }
  }

  // Download handlers
  const downloadImageOrPDF = async (type) => {
    if (!combinedRef.current) return

    try {
      const canvas = await html2canvas(combinedRef.current, { 
        useCORS: true, 
        allowTaint: true, 
        backgroundColor: '#ffffff',
        scale: 2 // Higher quality
      })

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95)

      if (type === 'jpg' || type === 'jpeg') {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `zone_${zoneId}_before_after.${type}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else if (type === 'pdf') {
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        })
        pdf.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height)
        pdf.save(`zone_${zoneId}_before_after.pdf`)
      }

      setSuccess(`${type.toUpperCase()} downloaded successfully!`)
    } catch (error) {
      setError('Download failed. Please try again.')
    }
  }

  if (loading) return <div className="loading">Loading zone data...</div>

  const placeholderPath = "/placeholder.jpg"

  return (
    <div className="container">
      <div className="photo-section">
        <h2>Zone {zoneId} Documentation</h2>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        {/* Combined Before/After Preview - Always Show */}
        <div className="combined-photo-box" ref={combinedRef}>
          <div className="photo-label-box">
            <div className="photo-item">
              <img
                src={zoneData?.beforePhoto?.url || placeholderPath}
                alt="Before"
                className="combined-photo-img"
              />
              <div className="photo-caption">
                Before<br />
                {zoneData?.beforePhoto?.timestamp
                  ? moment(zoneData.beforePhoto.timestamp).format('YYYY-MM-DD HH:mm')
                  : "Not uploaded yet"}
              </div>
            </div>
            <div className="photo-item">
              <img
                src={zoneData?.afterPhoto?.url || placeholderPath}
                alt="After"
                className="combined-photo-img"
              />
              <div className="photo-caption">
                After<br />
                {zoneData?.afterPhoto?.timestamp
                  ? moment(zoneData.afterPhoto.timestamp).format('YYYY-MM-DD HH:mm')
                  : "Not uploaded yet"}
              </div>
            </div>
          </div>
        </div>

        {/* Download Section - only if both images present */}
        {isComplete && (
          <div className="download-section">
            <h3>📥 Download Documentation</h3>
            <button className="btn btn-primary" onClick={() => downloadImageOrPDF('jpg')}>
              Download JPG
            </button>
            <button className="btn btn-primary" onClick={() => downloadImageOrPDF('jpeg')}>
              Download JPEG
            </button>
            <button className="btn btn-success" onClick={() => downloadImageOrPDF('pdf')}>
              Download PDF
            </button>
          </div>
        )}

        {/* Reset Section - show if at least one photo exists */}
        {(zoneData?.beforePhoto || zoneData?.afterPhoto) && (
          <div className="reset-section">
            <h3>🔄 Reset Zone</h3>
            <p style={{ margin: '10px 0', color: '#7f8c8d' }}>
              Clear all photos and timestamps to start fresh documentation
            </p>
            <button className="btn btn-danger" onClick={resetZone}>
              Reset Zone
            </button>
          </div>
        )}

        {/* Upload Section for Before Photo */}
        {canUploadBefore && (
          <div>
            <h3 className="single-label">📷 Upload Before Photo</h3>
            <div className="photo-upload">
              <input
                type="file"
                id="beforePhoto"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <label htmlFor="beforePhoto" className="upload-label">
                Select Before Photo
              </label>
              <p style={{ marginTop: '15px', color: '#7f8c8d' }}>
                Upload the initial state photo to begin documentation
              </p>
            </div>
          </div>
        )}

        {/* Upload Section for After Photo */}
        {canUploadAfter && (
          <div>
            <h3 className="single-label">📷 Upload After Photo</h3>
            <div className="photo-upload">
              <input
                type="file"
                id="afterPhoto"
                accept="image/*"
                onChange={handleFileSelect}
              />
              <label htmlFor="afterPhoto" className="upload-label">
                Select After Photo
              </label>
              <p style={{ marginTop: '15px', color: '#7f8c8d' }}>
                Upload the final state photo to complete documentation
              </p>
            </div>
          </div>
        )}

        {/* Preview and Upload Buttons */}
        {previewUrl && (
          <div className="photo-preview">
            <h4 style={{ color: '#2c3e50', marginBottom: '15px', fontSize: '1.3rem' }}>Preview</h4>
            <img src={previewUrl} alt="Preview" />
            <div style={{ marginTop: '25px' }}>
              {canUploadBefore && (
                <button
                  className="btn btn-primary"
                  onClick={() => uploadPhoto('before')}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload as Before Photo'}
                </button>
              )}
              {canUploadAfter && (
                <button
                  className="btn btn-success"
                  onClick={() => uploadPhoto('after')}
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload as After Photo'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Time Difference Display */}
        {timeDifference && (
          <div className="time-difference">
            <h3>⏱️ Time Difference</h3>
            <div className="time-value">{timeDifference}</div>
            <p>Time elapsed between before and after photos</p>
          </div>
        )}

        {/* Completion Status */}
        {isComplete && (
          <div className="success" style={{ marginTop: '30px', fontSize: '1.1rem' }}>
            ✅ Zone {zoneId} documentation complete! You can download reports or reset for new documentation.
          </div>
        )}

        {/* Back Button */}
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => router.push('/')}
          >
            ← Back to Zone Overview
          </button>
        </div>
      </div>
    </div>
  )
}
