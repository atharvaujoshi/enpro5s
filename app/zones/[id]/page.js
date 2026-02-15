"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import moment from 'moment'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  FileImage, 
  CheckSquare, 
  XSquare, 
  Download,
  Clock,
  ShieldCheck,
  Bell,
  ChevronRight,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { Header } from '@/components/Header'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

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
        setSelectedFile(null)
        setPreviewUrl(null)
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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
      <p className="mt-4 text-slate-500 font-bold animate-pulse">Initializing Secure Inspection Session...</p>
    </div>
  )

  const workRecords = zoneData?.workRecords || []
  const availableWorks = workRecords.filter(w => w.beforePhotos?.length > 0 && w.status !== 'complete' && w.workType === selectedWorkType)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 container py-12 space-y-10">
        {/* Breadcrumbs & Title */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-tighter">
              <span>Operations</span>
              <ChevronRight size={14} />
              <span className="text-primary">Zone {zoneId}</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Inspection Records</h1>
          </div>
          
          {session?.user?.role !== 'ceo' && (
            <Button 
              size="lg" 
              className="rounded-2xl h-14 px-8 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
              onClick={() => setShowUploadForm(!showUploadForm)}
            >
              {showUploadForm ? <XSquare className="mr-2 h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
              {showUploadForm ? 'Cancel Entry' : 'New Inspection'}
            </Button>
          )}
        </div>

        {/* Modern Upload Interface */}
        <AnimatePresence>
          {showUploadForm && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="glass-card border-none shadow-xl">
                <CardContent className="p-8 md:p-12">
                  <div className="max-w-3xl mx-auto space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">1. Select Protocol</Label>
                        <Tabs value={selectedWorkType} onValueChange={setSelectedWorkType} className="w-full">
                          <TabsList className="grid grid-cols-3 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1.5">
                            <TabsTrigger value="WPP" className="rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">WPP</TabsTrigger>
                            <TabsTrigger value="WFP" className="rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">WFP</TabsTrigger>
                            <TabsTrigger value="FPP" className="rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm">FPP</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-xs font-black uppercase tracking-widest text-slate-400">2. Record Phase</Label>
                        <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl h-14">
                          {session?.user?.role !== 'zone_manager' && (
                            <button 
                              className={cn(
                                "flex-1 rounded-xl font-bold transition-all",
                                photoType === 'before' ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-slate-500"
                              )}
                              onClick={() => setPhotoType('before')}
                            >
                              Before
                            </button>
                          )}
                          <button 
                            className={cn(
                              "flex-1 rounded-xl font-bold transition-all",
                              photoType === 'after' ? "bg-white dark:bg-slate-950 shadow-sm text-primary" : "text-slate-500"
                            )}
                            onClick={() => setPhotoType('after')}
                          >
                            After
                          </button>
                        </div>
                      </div>
                    </div>

                    {photoType === 'after' && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        <Label htmlFor="active-task" className="text-xs font-black uppercase tracking-widest text-slate-400">3. Link to Active Task</Label>
                        <Select value={selectedWorkId} onValueChange={setSelectedWorkId}>
                          <SelectTrigger id="active-task" className="h-14 rounded-2xl bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
                            <SelectValue placeholder="Identify work record..." />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800">
                            {availableWorks.map(w => (
                              <SelectItem key={w._id} value={w._id} className="rounded-xl py-3">
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline">{w.workType}</Badge>
                                  <span className="font-mono font-bold">{w._id.slice(-8).toUpperCase()}</span>
                                </div>
                              </SelectItem>
                            ))}
                            {availableWorks.length === 0 && (
                              <div className="p-4 text-center text-xs font-bold text-slate-400">No active {selectedWorkType} records available</div>
                            )}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                        {photoType === 'after' ? '4.' : '3.'} Documentation Evidence
                      </Label>
                      <label 
                        className={cn(
                          "flex flex-col items-center justify-center w-full py-16 border-2 border-dashed rounded-[32px] cursor-pointer transition-all bg-white/30 dark:bg-slate-900/30 hover:bg-white/50 dark:hover:bg-slate-900/50",
                          selectedFile ? "border-primary/50 bg-primary/5" : "border-slate-200 dark:border-slate-800"
                        )}
                      >
                        <div className="flex flex-col items-center justify-center space-y-4">
                          <div className={cn(
                            "p-4 rounded-2xl transition-colors",
                            selectedFile ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                          )}>
                            <FileImage size={32} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black text-slate-900 dark:text-white">
                              {selectedFile ? selectedFile.name : 'Choose or drag photo'}
                            </p>
                            <p className="text-xs font-medium text-slate-500">RAW, JPEG, PNG (Max 10MB)</p>
                          </div>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
                      </label>
                    </div>

                    {previewUrl && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                        <div className="relative rounded-[32px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl">
                          <img src={previewUrl} className="w-full max-h-[400px] object-cover" />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white/90 dark:bg-slate-950/90 text-primary backdrop-blur-md border-none font-black">PREVIEW</Badge>
                          </div>
                        </div>
                        <Button 
                          className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/30"
                          onClick={uploadPhoto}
                          disabled={uploading || (photoType === 'after' && !selectedWorkId)}
                        >
                          {uploading ? (
                            <>
                              <Activity className="mr-3 h-6 w-6 animate-spin" />
                              Processing Evidence...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-3 h-6 w-6" />
                              Commit to Protocol
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inspection Records List */}
        <div className="space-y-12">
          {workRecords.map((work, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.05 }} 
              key={work._id} 
              className="work-record overflow-hidden"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-3xl font-black text-primary">{work.workType}</span>
                  <span className="font-mono text-sm font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">#{work._id.slice(-8).toUpperCase()}</span>
                  {work.status === 'complete' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full font-black">VERIFIED</Badge>
                  ) : (
                    <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 px-4 py-1.5 rounded-full font-black uppercase">In Review</Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  {session?.user?.role === 'ceo' && work.status !== 'complete' && (
                    <Button variant="outline" className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 font-bold" onClick={() => pingManager(work._id)}>
                      <Bell size={16} className="mr-2" /> Urgent Ping
                    </Button>
                  )}
                  <div className={cn(
                    "flex items-center gap-3 px-5 py-2.5 rounded-2xl font-black text-sm shadow-inner",
                    moment() > moment(work.deadline) ? "bg-rose-50 text-rose-600" : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                  )}>
                    <Clock size={16} /> 
                    <span>DEADLINE: {moment(work.deadline).format('MMM DD, HH:mm')}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-primary" /> 
                    Initial Baseline (Before)
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {work.beforePhotos.map(p => (
                      <div key={p._id} className="photo-card group">
                        <img src={p.url} className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="photo-overlay">
                          <Activity size={12} className="inline mr-2" />
                          {moment(p.timestamp).format('DD MMM YYYY, HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> 
                    Final Execution (After)
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {work.afterPhotos.length > 0 ? (
                      work.afterPhotos.map(p => (
                        <div key={p._id} className="photo-card group">
                          <img src={p.url} className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="photo-overlay">
                            <CheckCircle2 size={12} className="inline mr-2 text-emerald-400" />
                            {moment(p.timestamp).format('DD MMM YYYY, HH:mm')}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="aspect-[4/3] rounded-[32px] bg-slate-50 dark:bg-slate-900/50 border-4 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <ImageIcon size={48} className="opacity-20" />
                        <p className="text-xs font-black uppercase tracking-widest opacity-50">Awaiting Evidence</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {session?.user?.role === 'ceo' && work.status === 'inprogress' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 p-8 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[32px] border border-indigo-100 dark:border-indigo-900/20">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl">
                      <ShieldCheck size={20} />
                    </div>
                    <h4 className="text-lg font-black tracking-tight">Executive Verification</h4>
                  </div>
                  
                  <div className="space-y-6">
                    <Textarea 
                      placeholder="Enter detailed review notes or reason for rejection..." 
                      value={approvalComment} 
                      onChange={(e) => setApprovalComment(e.target.value)} 
                      className="min-h-[120px] rounded-2xl bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900/30 focus-visible:ring-indigo-600"
                    />
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button 
                        className="flex-1 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black shadow-lg shadow-emerald-600/20" 
                        onClick={() => approveWork(work._id, true)}
                      >
                        <CheckSquare className="mr-2 h-5 w-5" /> Confirm Execution
                      </Button>
                      <Button 
                        variant="destructive"
                        className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-rose-600/20" 
                        onClick={() => approveWork(work._id, false)}
                      >
                        <XSquare className="mr-2 h-5 w-5" /> Reject Protocol
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {workRecords.length === 0 && (
            <div className="py-32 text-center bg-white/30 dark:bg-slate-900/30 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800">
              <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Inspection Data</h3>
              <p className="text-slate-500 font-medium">Capture the initial state to begin the documentation protocol.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
