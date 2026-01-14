import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  return (
    <div className='min-h-screen bg-background text-foreground atmosphere relative noise-overlay'>
      {/* Sidebar for Desktop */}
      <Sidebar member={member} />

      {/* Main Content Area */}
      <div className='flex flex-col transition-all duration-300 ease-in-out md:pl-[var(--sidebar-width,256px)] relative z-10'>
        <Header member={member} />

        <main className='flex-1 flex flex-col p-4 md:p-6 lg:p-8'>
          <div className='container mx-auto max-w-7xl flex-1 flex flex-col'>{children}</div>
        </main>
      </div>
    </div>
  )
}
