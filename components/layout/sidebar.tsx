'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mainNavItems, adminNavItems } from './nav-items'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SidebarProps = {
  className?: string
  member: any
}

export function Sidebar({ className, member }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const isAdmin = member?.role === 'admin' || member?.role === 'owner'

  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', isCollapsed ? '64px' : '256px')
  }, [isCollapsed])

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out border-r border-sidebar-border bg-sidebar z-50',
        // Subtle vertical gradient for depth
        'bg-gradient-to-b from-sidebar via-sidebar to-[hsl(280_25%_3%)]',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}>
      {/* Header */}
      <div
        className={cn(
          'p-4 border-b border-sidebar-border/50 flex items-center h-14',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}>
        {!isCollapsed && (
          <h1 className='text-xl font-bold font-display text-gradient-primary'>KinkOS</h1>
        )}
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setIsCollapsed(!isCollapsed)}
          className='h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors'>
          {isCollapsed ? <ChevronRight className='h-4 w-4' /> : <ChevronLeft className='h-4 w-4' />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className='flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-6'>
        {/* Main Navigation */}
        <div>
          <div
            className={cn(
              'transition-all duration-300 overflow-hidden',
              isCollapsed ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100 mb-3'
            )}>
            <p className='text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-[0.15em] px-3 whitespace-nowrap'>
              Navigation
            </p>
          </div>
          <div className='space-y-1'>
            {mainNavItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-primary/15 text-primary border-l-2 border-accent-gold shadow-[inset_0_0_20px_hsl(330_100%_60%/0.1)]'
                      : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                    isCollapsed && 'justify-center px-0 border-l-0'
                  )}>
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-all',
                      isActive
                        ? 'text-primary'
                        : 'group-hover:text-accent-gold group-hover:scale-110'
                    )}
                  />
                  {!isCollapsed && <span className='truncate'>{item.title}</span>}
                  {isCollapsed && (
                    <div className='absolute left-full ml-3 px-2.5 py-1.5 bg-card text-card-foreground text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg border border-border/50'>
                      {item.title}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Admin Navigation */}
        {isAdmin && (
          <div>
            <div
              className={cn(
                'transition-all duration-300 overflow-hidden',
                isCollapsed ? 'h-0 opacity-0 mb-0' : 'h-auto opacity-100 mb-3'
              )}>
              <p className='text-[10px] font-semibold text-accent-gold/60 uppercase tracking-[0.15em] px-3 whitespace-nowrap'>
                Admin
              </p>
            </div>
            <div className='space-y-1'>
              {adminNavItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                      isActive
                        ? 'bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold'
                        : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50',
                      isCollapsed && 'justify-center px-0 border-l-0'
                    )}>
                    <Icon
                      className={cn(
                        'h-5 w-5 shrink-0 transition-all',
                        isActive
                          ? 'text-accent-gold'
                          : 'group-hover:text-accent-gold group-hover:scale-110'
                      )}
                    />
                    {!isCollapsed && <span className='truncate'>{item.title}</span>}
                    {isCollapsed && (
                      <div className='absolute left-full ml-3 px-2.5 py-1.5 bg-card text-card-foreground text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg border border-border/50'>
                        {item.title}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* User Profile Footer */}
      <div className='p-4 border-t border-sidebar-border/50 bg-gradient-to-r from-sidebar-accent/20 to-transparent'>
        <div className={cn('flex items-center gap-3', isCollapsed ? 'justify-center' : '')}>
          <div className='h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-primary to-accent-gold flex items-center justify-center text-white font-bold text-sm shadow-lg glow-primary'>
            {member?.display_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div
            className={cn(
              'flex-1 min-w-0 transition-all duration-300',
              isCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'
            )}>
            <p className='text-sm font-semibold truncate leading-none mb-1 text-sidebar-foreground'>
              {member?.display_name || 'User'}
            </p>
            <p className='text-[10px] text-accent-gold/70 truncate uppercase tracking-wider font-medium'>
              {member?.role || 'Member'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
