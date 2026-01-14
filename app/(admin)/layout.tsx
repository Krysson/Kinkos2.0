import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has admin role
  const { data: member, error } = await supabase
    .from('members')
    .select('*')
    .eq('auth_id', user.id)
    .maybeSingle()

  // If no member record exists, query failed, or user doesn't have admin/owner role, redirect
  if (error || !member || !['admin', 'owner'].includes(member.role)) {
    redirect('/dashboard')
  }

  return (
    <div className='min-h-screen bg-background text-foreground atmosphere relative noise-overlay'>
      {/* Sidebar for Desktop */}
      <Sidebar member={member} />

      {/* Main Content Area */}
      <div className='flex flex-col transition-all duration-300 ease-in-out md:pl-[var(--sidebar-width,256px)] relative z-10'>
        <Header member={member} />

        <main className='flex-1 flex flex-col p-4 md:p-6 lg:p-8'>
          <div className='container mx-auto max-w-7xl flex-1 flex flex-col'>
            <div className='mb-8'>
              <h1 className='text-3xl font-bold text-accent-magenta'>Admin Panel</h1>
              <p className='text-muted-foreground mt-2'>
                Manage users, shifts, and venue operations
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
