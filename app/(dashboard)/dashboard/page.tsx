import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Megaphone, Users, Clock, TrendingUp, LayoutGrid, CalendarDays, ArrowRight } from 'lucide-react'
import { format, formatDistanceToNow, differenceInDays, differenceInHours } from 'date-fns'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: member } = await supabase.from('members').select('*').eq('auth_id', user?.id).single()

  // Get time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Get my signups (for upcoming shifts I'm confirmed for)
  const { data: mySignups } = await supabase
    .from('shift_signups')
    .select(`
      *,
      shift:shifts(*)
    `)
    .eq('member_id', member?.id || '')
    .is('cancelled_at', null)
    .gte('shift.start_time', new Date().toISOString())
    .order('shift.start_time', { ascending: true })

  // Get next shift I'm signed up for
  const nextShift = mySignups?.[0]

  // Calculate next shift time difference
  let nextShiftText = ''
  if (nextShift?.shift) {
    const days = differenceInDays(new Date(nextShift.shift.start_time), new Date())
    const hours = differenceInHours(new Date(nextShift.shift.start_time), new Date()) % 24
    nextShiftText = `${nextShift.shift.title} starts in ${days} days, ${hours}h`
  }

  // Get available shifts (open shifts not yet at capacity)
  const { data: availableShifts } = await supabase
    .from('shifts')
    .select(`
      *,
      shift_signups(count)
    `)
    .eq('status', 'open')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })

  // Filter available shifts to only those not at capacity
  const openShifts = availableShifts?.filter((shift: any) => {
    const signupCount = shift.shift_signups?.[0]?.count || 0
    return signupCount < (shift.max_volunteers || 999)
  }) || []

  // Stats calculations
  const totalShifts = mySignups?.length || 0
  const thisMonthShifts = mySignups?.filter((s: any) => {
    const shiftMonth = new Date(s.shift.start_time).getMonth()
    return shiftMonth === new Date().getMonth()
  }).length || 0

  // Calculate total hours and hours/month
  const totalHours = mySignups?.reduce((acc: number, signup: any) => {
    if (signup.shift?.start_time && signup.shift?.end_time) {
      const hours = differenceInHours(
        new Date(signup.shift.end_time),
        new Date(signup.shift.start_time)
      )
      return acc + hours
    }
    return acc
  }, 0) || 0

  const hoursThisMonth = mySignups?.reduce((acc: number, signup: any) => {
    const shiftMonth = new Date(signup.shift.start_time).getMonth()
    if (shiftMonth === new Date().getMonth() && signup.shift?.start_time && signup.shift?.end_time) {
      const hours = differenceInHours(
        new Date(signup.shift.end_time),
        new Date(signup.shift.start_time)
      )
      return acc + hours
    }
    return acc
  }, 0) || 0

  // Get recent announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .lte('publish_at', new Date().toISOString())
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(1)

  return (
    <div className="space-y-6 pb-16">
      {/* Header with greeting and view toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <span>✨</span> {greeting}, <span className="text-accent-magenta">{member?.display_name}</span>!
          </h1>
          {nextShiftText && (
            <p className="text-sm text-muted-foreground mt-1">
              Your next shift: <span className="text-accent-teal font-medium">{nextShiftText}</span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="bg-accent-magenta hover:bg-accent-magenta/90">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Cards
          </Button>
          <Button variant="outline" size="sm">
            <CalendarDays className="h-4 w-4 mr-2" />
            Calendar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-accent-magenta mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-2xl font-bold">{totalShifts}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Shifts</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-accent-magenta mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-2xl font-bold">{thisMonthShifts}</span>
            </div>
            <p className="text-xs text-muted-foreground">This Month</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-accent-magenta mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-2xl font-bold">{totalHours}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Hours</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-accent-teal mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-2xl font-bold">{hoursThisMonth}</span>
            </div>
            <p className="text-xs text-muted-foreground">Hours/Month</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-accent-magenta mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-2xl font-bold">{mySignups?.length || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-accent-teal mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-2xl font-bold">{openShifts?.length || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <CalendarDays className="h-4 w-4" />
              <span className="text-2xl font-bold">1</span>
            </div>
            <p className="text-xs text-muted-foreground">In Play Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Announcement */}
      {announcements && announcements.length > 0 && (
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-accent-magenta" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">LATEST</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  <span className="text-sm font-medium">{announcements[0].title}</span>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="text-accent-magenta hover:text-accent-magenta/80">
                <Link href="/announcements" className="flex items-center gap-1">
                  Read more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shifts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Shifts (My confirmed shifts) */}
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent-magenta" />
              <CardTitle className="text-lg">Upcoming Shifts</CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-accent-magenta hover:text-accent-magenta/80">
              <Link href="/schedule" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Your confirmed shifts</p>
            <div className="space-y-3">
              {mySignups && mySignups.length > 0 ? (
                mySignups.slice(0, 3).map((signup: any) => {
                  const daysUntil = differenceInDays(new Date(signup.shift.start_time), new Date())
                  // Get signup count for this shift
                  const signupCount = signup.shift.shift_signups?.[0]?.count || 0
                  const maxVolunteers = signup.shift.max_volunteers || 4

                  return (
                    <Card key={signup.id} className="bg-zinc-900/50 border-zinc-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-accent-magenta" />
                            <div>
                              <h4 className="font-semibold text-sm">{signup.shift.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(signup.shift.start_time), 'EEE, MMM d')} • {format(new Date(signup.shift.start_time), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{signupCount}/{maxVolunteers}</span>
                              </div>
                              <p className="text-xs text-accent-magenta mt-1">in {daysUntil} days</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No upcoming shifts</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Available Shifts */}
        <Card className="bg-zinc-800/50 border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent-teal" />
              <CardTitle className="text-lg">Available Shifts</CardTitle>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-accent-teal hover:text-accent-teal/80">
              <Link href="/schedule" className="flex items-center gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">Shifts you can sign up for</p>
            <div className="space-y-3">
              {openShifts && openShifts.length > 0 ? (
                openShifts.slice(0, 3).map((shift: any) => {
                  const daysUntil = differenceInDays(new Date(shift.start_time), new Date())
                  const signupCount = shift.shift_signups?.[0]?.count || 0
                  const maxVolunteers = shift.max_volunteers || 4

                  return (
                    <Card key={shift.id} className="bg-zinc-900/50 border-zinc-700">
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-accent-teal" />
                            <div>
                              <h4 className="font-semibold text-sm">{shift.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(shift.start_time), 'EEE, MMM d')} • {format(new Date(shift.start_time), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>{signupCount}/{maxVolunteers}</span>
                              </div>
                              <p className="text-xs text-accent-teal mt-1">in {daysUntil} days</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No available shifts</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-muted-foreground py-4">
        KinkOS by Krysson Consulting © 2026 - Development Build: v0.12.4
      </div>
    </div>
  )
}
