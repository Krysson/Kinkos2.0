import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has admin role
  const { data: member, error } = await supabase
    .from('members')
    .select('role')
    .eq('auth_id', user.id)
    .maybeSingle()

  // If no member record exists, query failed, or user doesn't have admin/owner role, redirect
  if (error || !member || !['admin', 'owner'].includes(member.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-accent-magenta">Admin Panel</h1>
          <p className="text-muted-foreground mt-2">Manage users, shifts, and venue operations</p>
        </div>
        {children}
      </div>
    </div>
  )
}
