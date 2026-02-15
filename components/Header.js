"use client"

import React from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ShieldCheck, 
  LogOut, 
  ArrowLeft,
  User
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

export function Header() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const zoneId = params?.id

  const isAuthenticated = status === "authenticated"

  return (
    <header className="glass-header sticky top-0 z-50 w-full">
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-6">
          {zoneId && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push('/')}
              className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={20} />
            </Button>
          )}
          <Link href="/" className="brand-logo">
            <ShieldCheck size={32} className="text-primary animate-pulse-slow" />
            <span className="hidden sm:inline-block">ZoneTracker</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-glass-border">
              <div className="hidden md:flex flex-col items-end gap-0.5">
                <span className="text-sm font-bold leading-none">{session.user.name}</span>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider px-1.5 py-0 h-4 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-none">
                  {session.user.role}
                </Badge>
              </div>
              
              <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-bold">
                  {session.user.name?.charAt(0) || <User size={18} />}
                </AvatarFallback>
              </Avatar>

              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => signOut()}
                className="rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut size={20} />
              </Button>
            </div>
          ) : (
            <div className="pl-4 border-l border-glass-border">
              <Button variant="ghost" disabled className="text-slate-400">
                Secure Session
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
