"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  XCircle,
  TrendingUp
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'

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

export function StatsOverview({ stats }) {
  if (!stats) return null

  const chartData = Object.entries(stats).map(([name, counts]) => ({
    name,
    pending: counts.pending,
    completed: counts.completed,
    rejected: counts.rejected,
  }))

  const colors = {
    pending: "#f59e0b",
    completed: "#10b981",
    rejected: "#ef4444"
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <TrendingUp className="text-primary h-6 w-6" />
            Global Project Status
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Real-time protocol execution analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Statistics Cards */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(stats).map(([type, counts]) => (
            <motion.div key={type} variants={itemVariants}>
              <Card className="glass-card h-full border-none shadow-sm overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-primary rounded-lg">
                      <Building size={20} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">{type}</CardTitle>
                      <CardDescription className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Unit Protocol</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <div className="text-xl font-black text-amber-700 dark:text-amber-400">{counts.pending}</div>
                      <div className="text-[9px] font-black text-amber-600/70 uppercase">Open</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                      <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">{counts.completed}</div>
                      <div className="text-[9px] font-black text-emerald-600/70 uppercase">Done</div>
                    </div>
                    <div className="text-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30">
                      <div className="text-xl font-black text-rose-700 dark:text-rose-400">{counts.rejected}</div>
                      <div className="text-[9px] font-black text-rose-600/70 uppercase">Fail</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Visual Analytics */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-none shadow-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Activity distribution</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}
                  />
                  <Bar dataKey="completed" stackId="a" fill={colors.completed} radius={[0, 0, 0, 0]} barSize={30} />
                  <Bar dataKey="pending" stackId="a" fill={colors.pending} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="rejected" stackId="a" fill={colors.rejected} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
