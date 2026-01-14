import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  Users,
  BookOpen,
  Contact,
  ShieldCheck,
  UserCog,
  UserPlus,
  CalendarPlus
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
    icon: LayoutDashboard
  },
  {
    title: 'My Profile',
    href: '/profile',
    icon: UserCog
  },
  {
    title: 'Schedule',
    href: '/schedule',
    icon: Calendar
  },
  {
    title: 'Announcements',
    href: '/announcements',
    icon: Megaphone
  },
  {
    title: 'Resources',
    href: '/resources',
    icon: BookOpen
  },
  {
    title: 'Contacts',
    href: '/contacts',
    icon: Contact
  }
]

export const adminNavItems: NavItem[] = [
  {
    title: 'Admin Dashboard',
    href: '/admin',
    icon: ShieldCheck,
    adminOnly: true
  },
  {
    title: 'Staff & Users',
    href: '/admin/users',
    icon: UserCog,
    adminOnly: true
  },
  {
    title: 'Members',
    href: '/admin/members',
    icon: Users,
    adminOnly: true
  },
  {
    title: 'Check-In',
    href: '/check-in',
    icon: UserPlus,
    adminOnly: true
  },
  {
    title: 'Shifts',
    href: '/admin/shifts',
    icon: CalendarPlus,
    adminOnly: true
  }
]
