import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CheckInDashboard } from '@/components/dashboard/check-in-dashboard'

export default async function CheckInPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if member is at least a volunteer
  const { data: member } = await supabase
    .from('members')
    .select('id, role')
    .eq('auth_id', user.id)
    .single()

  if (!member || !['volunteer', 'lead', 'admin', 'owner'].includes(member.role)) {
    redirect('/dashboard')
  }

  return (
    <div className='container mx-auto py-6 space-y-6'>
      <div className='flex flex-col gap-2'>
        <h1 className='text-3xl font-bold tracking-tight'>Venue Check-In</h1>
        <p className='text-muted-foreground'>Identify and check members in or out.</p>
      </div>

      <CheckInDashboard userId={member.id} />
    </div>
  )
}
