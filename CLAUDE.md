# CLAUDE.md - KinkOS 2.0

## Project Overview
KinkOS 2.0 - Venue management system for The Woodshed Orlando (private membership club).
Manages volunteers, members, shifts, check-ins, and venue operations.

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict)
- **Database:** Supabase (PostgreSQL + Auth + RLS)
- **UI:** shadcn/ui + Tailwind CSS
- **State:** TanStack React Query 5.x
- **Icons:** lucide-react
- **Forms:** react-hook-form + zod
- **Hosting:** Vercel

## Project Structure
```
app/
├── (auth)/           # Login, register (public)
├── (dashboard)/      # Main app (protected)
├── (admin)/          # Admin pages (role-gated)
├── api/              # API routes
└── layout.tsx

components/
├── ui/               # shadcn components
├── layout/           # Sidebar, header, mobile-nav
├── dashboard/        # Dashboard-specific
├── schedule/         # Shift/calendar components
└── shared/           # Reusable across features

lib/
├── supabase/         # client.ts, server.ts, middleware.ts
├── types.ts          # Database types
└── utils.ts          # Helpers (cn, formatDate, etc.)

hooks/
├── use-auth.ts
└── queries/          # React Query hooks per feature
```

## Database Tables
- `members` - All users (volunteers, admins, members, guests)
- `member_roles` - Role assignments (volunteer, lead, admin, owner)
- `shifts` - Scheduled shifts
- `shift_signups` - Member-shift associations
- `announcements` - Broadcast messages
- `announcement_reads` - Read tracking
- `resources` - Document/link library

## Key Patterns

### Supabase Client
```typescript
// Server components
import { createServerSupabaseClient } from '@/lib/supabase/server'
const supabase = await createServerSupabaseClient()

// Client components
import { createClient } from '@/lib/supabase/client'
const supabase = createClient()
```

### Auth Check (Server)
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### React Query Pattern
```typescript
// hooks/queries/use-shifts.ts
export function useShifts() {
  return useQuery({
    queryKey: ['shifts'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('shifts')
        .select('*, shift_signups(count)')
        .gte('start_time', new Date().toISOString())
        .order('start_time')
      if (error) throw error
      return data
    }
  })
}
```

### Component Pattern
```typescript
// Always use 'use client' for interactive components
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useShifts } from '@/hooks/queries/use-shifts'

export function ShiftList() {
  const { data: shifts, isLoading } = useShifts()
  if (isLoading) return <Skeleton />
  return (/* JSX */)
}
```

## Design System

### Colors
- Background: `#171717` (zinc-900)
- Card: `#262626` (zinc-800)
- Primary: `#D946EF` (magenta/fuchsia-500)
- Secondary: `#06B6D4` (teal/cyan-500)
- Muted: `#a1a1aa` (zinc-400)

### Spacing
- Card padding: `p-4` or `p-6`
- Section gaps: `space-y-4` or `gap-4`
- Page padding: `p-4 md:p-6`

### Responsive Breakpoints
- Mobile: < 768px (hamburger menu)
- Tablet: 768px - 1023px
- Desktop: ≥ 1024px (sidebar)

## Coding Standards

### Do
- Use Server Components by default
- Add 'use client' only when needed (hooks, events, browser APIs)
- Colocate queries in `hooks/queries/`
- Use shadcn components from `@/components/ui`
- Handle loading/error/empty states
- Use TypeScript strict mode

### Don't
- Don't use `any` type
- Don't fetch in useEffect (use React Query)
- Don't hardcode colors (use Tailwind classes)
- Don't skip error handling
- Don't use default exports for components (use named)

## Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # Run ESLint
npx shadcn@latest add [component]  # Add shadcn component
```

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Role Hierarchy
1. **Owner** - Full access, can assign any role
2. **Admin** - Full operational control, can ban/suspend
3. **Lead** - Enhanced permissions, approve members, add notes
4. **Volunteer** - Basic access, view/signup shifts

## Quick Reference

### Protected Route Check
```typescript
// In page.tsx or layout.tsx
const supabase = await createServerSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')
```

### Admin Route Check
```typescript
const { data: roles } = await supabase
  .from('member_roles')
  .select('role')
  .eq('member_id', memberId)
  
const isAdmin = roles?.some(r => ['admin', 'owner'].includes(r.role))
if (!isAdmin) redirect('/dashboard')
```

### Get Current Member
```typescript
const { data: member } = await supabase
  .from('members')
  .select('*')
  .eq('auth_user_id', user.id)
  .single()
```
