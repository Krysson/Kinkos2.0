'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut, User, Settings, Menu, Bell } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { createClient } from '@/utils/supabase/client'
import { mainNavItems, adminNavItems } from './nav-items'
import { cn } from '@/lib/utils'

type HeaderProps = {
  member: any
}

export function Header({ member }: HeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isAdmin = member?.role === 'admin' || member?.role === 'owner'

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  // Get page title from pathname
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    const segment = pathname.split('/').pop()
    return segment?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Dashboard'
  }

  return (
    <header className='sticky top-0 z-40 w-full glass h-12 px-4 flex items-center justify-between'>
      <div className='flex items-center gap-4'>
        {/* Mobile Menu Trigger */}
        <Sheet
          open={isMobileMenuOpen}
          onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='md:hidden h-8 w-8 text-muted-foreground hover:text-foreground'>
              <Menu className='h-5 w-5' />
              <span className='sr-only'>Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side='left'
            className='w-72 p-0 bg-sidebar border-r border-sidebar-border bg-gradient-to-b from-sidebar via-sidebar to-[hsl(280_25%_3%)]'>
            <div className='p-6 border-b border-sidebar-border/50'>
              <h1 className='text-xl font-bold font-display text-gradient-primary'>KinkOS</h1>
            </div>
            <nav className='flex-1 overflow-y-auto p-4 space-y-6'>
              <div>
                <p className='text-[10px] font-semibold text-sidebar-foreground/40 uppercase tracking-[0.15em] px-3 mb-3'>
                  Navigation
                </p>
                <div className='space-y-1'>
                  {mainNavItems.map(item => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                          isActive
                            ? 'bg-primary/15 text-primary border-l-2 border-accent-gold'
                            : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                        )}>
                        <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                        <span>{item.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

              {isAdmin && (
                <div>
                  <p className='text-[10px] font-semibold text-accent-gold/60 uppercase tracking-[0.15em] px-3 mb-3'>
                    Admin
                  </p>
                  <div className='space-y-1'>
                    {adminNavItems.map(item => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                            isActive
                              ? 'bg-accent-gold/10 text-accent-gold border-l-2 border-accent-gold'
                              : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
                          )}>
                          <Icon className={cn('h-5 w-5', isActive && 'text-accent-gold')} />
                          <span>{item.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo (shown on mobile, hidden on desktop since it's in sidebar) */}
        <div className='md:hidden'>
          <Link
            href='/dashboard'
            className='text-lg font-bold font-display text-gradient-primary'>
            KinkOS
          </Link>
        </div>

        {/* Page Title for Desktop */}
        <div className='hidden md:block'>
          <h2 className='text-sm font-medium text-muted-foreground font-display tracking-wide'>
            {getPageTitle()}
          </h2>
        </div>
      </div>

      <div className='flex items-center gap-1'>
        {/* Notification Bell with gold dot */}
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8 text-muted-foreground hover:text-foreground relative'>
          <Bell className='h-4 w-4' />
          <span className='absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent-gold' />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              className='relative h-8 w-8 rounded-full ml-1'>
              <div className='h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent-gold flex items-center justify-center text-white font-bold text-xs shadow-lg glow-primary'>
                {member?.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-56 mt-2 glass border-border/50'>
            <DropdownMenuLabel>
              <div className='flex flex-col space-y-1'>
                <p className='text-sm font-semibold font-display'>
                  {member?.display_name || 'User'}
                </p>
                <p className='text-xs text-muted-foreground truncate'>{member?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className='bg-border/50' />
            <DropdownMenuItem
              onClick={() => router.push('/profile')}
              className='cursor-pointer hover:bg-sidebar-accent/50'>
              <User className='mr-2 h-4 w-4' />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem
                onClick={() => router.push('/admin')}
                className='cursor-pointer hover:bg-sidebar-accent/50'>
                <Settings className='mr-2 h-4 w-4 text-accent-gold' />
                <span>Admin Console</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className='bg-border/50' />
            <DropdownMenuItem
              onClick={handleSignOut}
              className='text-destructive cursor-pointer hover:bg-destructive/10'>
              <LogOut className='mr-2 h-4 w-4' />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
