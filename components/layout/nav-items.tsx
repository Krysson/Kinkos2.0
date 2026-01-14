import {
  Home,
  Calendar,
  Megaphone,
  FileText,
  Users,
  User,
  UserCog,
  CalendarPlus,
  Settings,
} from 'lucide-react'

export type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

export const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Schedule',
    href: '/schedule',
    icon: Calendar,
  },
  {
    title: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
  },
  {
    title: 'Resources',
    href: '/resources',
    icon: FileText,
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: Users,
  },
  {
    title: 'Profile',
    href: '/profile',
    icon: User,
  },
]

export const adminNavItems: NavItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/admin',
    icon: Settings,
    adminOnly: true,
  },
  {
    title: 'Members',
    href: '/admin/members',
    icon: UserCog,
    adminOnly: true,
  },
  {
    title: 'Shifts',
    href: '/admin/shifts',
    icon: CalendarPlus,
    adminOnly: true,
  },
]
