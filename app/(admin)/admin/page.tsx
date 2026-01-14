import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserCog, CalendarPlus, Megaphone, Users, Calendar, FileText } from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  // Get stats
  const { count: totalMembers } = await supabase.from('members').select('*', { count: 'exact', head: true })

  const { count: activeMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: totalShifts } = await supabase
    .from('shifts')
    .select('*', { count: 'exact', head: true })
    .gte('start_time', new Date().toISOString())

  const { count: openShifts } = await supabase
    .from('shifts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'open')
    .gte('start_time', new Date().toISOString())

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">{activeMembers || 0} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalShifts || 0}</div>
            <p className="text-xs text-muted-foreground">{openShifts || 0} open</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shift Fill Rate</CardTitle>
            <CalendarPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
              <Link href="/admin/members">
                <UserCog className="h-8 w-8" />
                <span>Manage Members</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
              <Link href="/admin/shifts">
                <CalendarPlus className="h-8 w-8" />
                <span>Manage Shifts</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-24 flex flex-col gap-2">
              <Link href="/admin/announcements">
                <Megaphone className="h-8 w-8" />
                <span>Create Announcement</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest system events and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Activity feed coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
