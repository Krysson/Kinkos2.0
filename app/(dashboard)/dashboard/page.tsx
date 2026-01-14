import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Megaphone, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: member } = await supabase.from('members').select('*').eq('auth_id', user?.id).single()

  // Get upcoming shifts count
  const { count: upcomingShiftsCount } = await supabase
    .from('shifts')
    .select('*', { count: 'only', head: true })
    .eq('status', 'open')
    .gte('start_time', new Date().toISOString())

  // Get my signups count
  const { count: mySignupsCount } = await supabase
    .from('shift_signups')
    .select('*', { count: 'only', head: true })
    .eq('member_id', member?.id || '')
    .is('cancelled_at', null)

  // Get next shift I'm signed up for
  const { data: nextShift } = await supabase
    .from('shift_signups')
    .select(
      `
      *,
      shift:shifts(*)
    `
    )
    .eq('member_id', member?.id || '')
    .is('cancelled_at', null)
    .gte('shift.start_time', new Date().toISOString())
    .order('shift.start_time', { ascending: true })
    .limit(1)
    .single()

  // Get recent announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .lte('publish_at', new Date().toISOString())
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, <span className="text-accent-magenta">{member?.display_name}</span>!
        </h1>
        <p className="text-muted-foreground mt-2">Here's what's happening at The Woodshed Orlando</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Shifts</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingShiftsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Available to sign up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Shifts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mySignupsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Shifts you're signed up for</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{announcements?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Recent updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Shift */}
      {nextShift?.shift && (
        <Card className="border-accent-teal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent-teal" />
              Your Next Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{nextShift.shift.title}</h3>
              <p className="text-muted-foreground">{nextShift.shift.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <span>
                  {format(new Date(nextShift.shift.start_time), 'PPP')} at{' '}
                  {format(new Date(nextShift.shift.start_time), 'p')}
                </span>
                <span className="text-muted-foreground">•</span>
                <span>{nextShift.shift.location}</span>
              </div>
              <Button asChild className="mt-4">
                <Link href="/schedule">View All Shifts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Announcements */}
      {announcements && announcements.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Announcements</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/announcements">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border-l-4 border-accent-magenta pl-4 py-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{announcement.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(announcement.created_at), 'PPP')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/schedule" className="flex flex-col items-center gap-2">
                <Calendar className="h-6 w-6" />
                <span>View Schedule</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/announcements" className="flex flex-col items-center gap-2">
                <Megaphone className="h-6 w-6" />
                <span>Read Announcements</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/contacts" className="flex flex-col items-center gap-2">
                <Users className="h-6 w-6" />
                <span>View Contacts</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
