'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { mainNavItems, adminNavItems } from './nav-items'
import { cn } from '@/lib/utils'

type SidebarProps = {
  className?: string
  member: any
}

export function Sidebar({ className, member }: SidebarProps) {
  const pathname = usePathname()
  const isAdmin = member?.role === 'admin' || member?.role === 'owner'

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen w-64 bg-card border-r border-border flex flex-col',
        className
      )}
    >
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-accent-magenta">The Woodshed</h1>
        <p className="text-xs text-muted-foreground mt-1">KinkOS v2.0</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Main</p>
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
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
          <div className="mt-6 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">Admin</p>
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
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
        )}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-accent-magenta flex items-center justify-center text-accent-magenta-foreground font-semibold">
            {member?.display_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member?.display_name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{member?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
