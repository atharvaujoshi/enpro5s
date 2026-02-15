"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { ShieldCheck, Mail, Lock, User, LogIn, Loader2, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
    <div className="login-container-premium bg-slate-50 dark:bg-slate-950">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md p-4"
      >
        <Card className="glass-card border-none shadow-2xl overflow-hidden">
          <CardHeader className="text-center pt-8 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4 ring-8 ring-primary/5">
              <ShieldCheck size={40} />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight">ZoneTracker</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 font-medium">
              Secure Industrial Zone Management
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm font-medium"
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({...prev, email: e.target.value}))}
                    required
                    className="pl-11 h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({...prev, password: e.target.value}))}
                    required
                    className="pl-11 h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Select Role</Label>
                <Select 
                  value={credentials.role} 
                  onValueChange={(v) => setCredentials(prev => ({...prev, role: v}))}
                >
                  <SelectTrigger id="role" className="h-12 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-primary">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-slate-400" />
                      <SelectValue placeholder="Choose role..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                    <SelectItem value="user" className="rounded-lg">User</SelectItem>
                    <SelectItem value="zone_manager" className="rounded-lg">Zone Manager</SelectItem>
                    <SelectItem value="ceo" className="rounded-lg">CEO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn size={20} className="mr-2" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pb-8">
            <div className="w-full h-px bg-slate-100 dark:bg-slate-800" />
            <div className="w-full space-y-3 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <h3 className="text-[10px] uppercase font-black tracking-widest text-slate-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Demo Access
              </h3>
              <div className="grid gap-2 text-xs font-medium">
                {[
                  { role: 'CEO', email: 'atharva.jjoshi20@gmail.com' },
                  { role: 'Manager', email: 'atharvaujoshi@gmail.com' },
                  { role: 'User', email: 'spydarr1106@gmail.com' }
                ].map((item) => (
                  <div key={item.role} className="flex justify-between items-center group">
                    <span className="text-slate-500 dark:text-slate-400">{item.role}</span>
                    <code className="bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-primary group-hover:border-primary/50 transition-colors">
                      {item.email}
                    </code>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-center text-slate-400 pt-1">
                Default password: <strong>password</strong>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
