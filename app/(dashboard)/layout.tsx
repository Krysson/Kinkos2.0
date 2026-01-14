import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: member } = await supabase.from('members').select('*').eq('auth_id', user.id).single()

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar member={member} className="hidden lg:flex" />

      {/* Main Content */}
      <div className="lg:pl-64">
        <Header member={member} />
        <main className="p-4 lg:p-8 pb-20 lg:pb-8">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileNav member={member} className="lg:hidden" />
    </div>
  )
}
