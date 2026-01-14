'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, User, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useState } from 'react'
import { mainNavItems, adminNavItems } from './nav-items'
import { Button } from '@/components/ui/button'

type MobileNavProps = {
  className?: string
  member?: any
}

export function MobileNav({ className, member }: MobileNavProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isAdmin = member?.role === 'admin' || member?.role === 'owner'

  const quickNavItems = [
    { title: 'Home', href: '/dashboard', icon: Home },
    { title: 'Schedule', href: '/schedule', icon: Calendar },
    { title: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around px-2',
        className
      )}
    >
      {quickNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center flex-1 h-full rounded-md transition-colors',
              isActive
                ? 'text-accent-magenta'
                : 'text-muted-foreground hover:text-accent-magenta'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs mt-1">{item.title}</span>
          </Link>
        )
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center flex-1 h-full rounded-md text-muted-foreground hover:text-accent-magenta"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs mt-1">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <div className="py-6">
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-accent-magenta text-accent-magenta-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                )
              })}
            </div>

            {isAdmin && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                  Admin
                </h3>
                <div className="space-y-1">
                  {adminNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-accent-teal text-accent-teal-foreground'
                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.title}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
