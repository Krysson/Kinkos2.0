'use client'

import React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

type DashboardLayoutProps = {
  children: React.ReactNode
  member: any
}

export function DashboardLayout({ children, member }: DashboardLayoutProps) {
  return (
    <div className='flex min-h-screen bg-background text-foreground'>
      {/* Sidebar for Desktop */}
      <Sidebar member={member} />

      {/* Main Content Area */}
      <div className='flex flex-col flex-1 transition-all duration-300 ease-in-out md:pl-[var(--sidebar-width,256px)]'>
        <Header member={member} />

        <main className='flex-1 overflow-x-hidden p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
          <div className='container mx-auto max-w-7xl'>{children}</div>
        </main>
      </div>
    </div>
  )
}
