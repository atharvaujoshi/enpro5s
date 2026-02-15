"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Clock, 
  ChevronRight,
  Activity
} from 'lucide-react'
import { Header } from '@/components/Header'
import { StatsOverview } from '@/components/StatsOverview'
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
      if (response && response.ok) {
        const data = await response.json()
        if (data) setStats(data)
      }
    } catch (error) {
      console.error('Error fetching report:', error)
    }
  }

  const fetchZones = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/zones?status=${activeTab}`)
      if (response && response.ok) {
        const data = await response.json()
        if (data) setZones(data)
      } else {
        console.error('Failed to fetch zones:', response?.status)
      }
    } catch (error) {
      console.error('Error fetching zones:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'complete': 
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Verified</Badge>
      case 'rejected': 
        return <Badge variant="destructive" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/20">Rejected</Badge>
      case 'inprogress': 
        return <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20">Active</Badge>
      default: 
        return <Badge variant="outline" className="text-slate-400 border-slate-200 dark:border-slate-800">Pending</Badge>
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <Header />

      <main className="flex-1 container py-12 space-y-12">
        {/* Welcome Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2 text-center"
        >
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Operations Center
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
            Welcome back, <span className="text-primary font-bold">{session?.user?.name || 'Authorized Personnel'}</span>.
          </p>
        </motion.div>

        {/* Executive Overview */}
        {session?.user?.role === 'ceo' && stats && (
          <StatsOverview stats={stats} />
        )}

        {/* Zone Management Section */}
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-6">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 justify-center">
              <Activity className="text-primary h-6 w-6" />
              Managed Zones
            </h2>
            
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap justify-center gap-1 w-full sm:w-auto">
              {[
                { id: 'unsolved', label: 'Unsolved', icon: AlertCircle },
                { id: 'complete', label: 'Completed', icon: CheckCircle2 },
                { id: 'rejected', label: 'Rejected', icon: XCircle }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                    activeTab === tab.id 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              <p className="mt-4 text-slate-500 font-bold animate-pulse">Synchronizing Environment...</p>
            </div>
          ) : (
            <>
              {zones.length > 0 ? (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                  {zones.map((zone) => (
                    <motion.div key={zone.id} variants={itemVariants}>
                      <Link href={`/zones/${zone.id}`} className="block group h-full">
                        <Card className="glass-card h-full border-none group-hover:ring-2 group-hover:ring-primary/50 transition-all flex flex-col items-center text-center">
                          <CardHeader className="pb-4 flex flex-col items-center">
                            <div className="flex flex-col items-center gap-4">
                              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors shadow-inner">
                                <MapPin size={20} />
                              </div>
                              {getStatusBadge(zone.status)}
                            </div>
                          </CardHeader>
                          
                          <CardContent className="flex-1">
                            <CardTitle className="text-xl font-black mb-1 group-hover:text-primary transition-colors">
                              Zone {zone.id}
                            </CardTitle>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Main Industrial Sector</p>
                          </CardContent>
                          
                          <CardFooter className="pt-0 pb-6 flex flex-col items-center gap-4 w-full">
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Active Tasks</span>
                              <span className="text-lg font-black leading-none">{zone.workCount || 0}</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Last Action</span>
                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold text-xs leading-none">
                                <Clock size={12} className="text-slate-400" />
                                {zone.lastUpdated || 'None'}
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-32 text-center bg-white/30 dark:bg-slate-900/30 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-slate-800"
                >
                  <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-6">
                    <LayoutDashboard size={40} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Clear Environment</h3>
                  <p className="text-slate-500 font-medium">No zones require attention in this category.</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
