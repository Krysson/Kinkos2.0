import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StaffManagementTable } from '@/components/admin/staff-management-table'
import type { Member } from '@/lib/types'

export default async function AdminUsersPage() {
  const supabase = await createServerSupabaseClient()

  // Fetch only staff (Volunteers, Leads, Admins, Owners)
  const { data: staff } = await supabase
    .from('members')
    .select('*')
    .in('role', ['owner', 'admin', 'lead', 'volunteer'])
    .order('created_at', { ascending: false })

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Staff & User Management</CardTitle>
          <CardDescription>
            Manage application users with administrative or volunteer privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffManagementTable initialStaff={(staff as unknown as Member[]) || []} />
        </CardContent>
      </Card>
    </div>
  )
}
