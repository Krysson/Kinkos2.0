import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Megaphone,
  Users,
  Clock,
  TrendingUp,
  LayoutGrid,
  CalendarDays,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { format, differenceInDays, differenceInHours } from 'date-fns'
import { cn } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()
  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('auth_id', user?.id)
    .single()

  // Get time-based greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Get my signups (for upcoming shifts I'm confirmed for)
  const { data: mySignups } = await supabase
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

  // Get next shift I'm signed up for
  const nextShift = mySignups?.[0]

  // Calculate next shift time difference
  let nextShiftText = ''
  if (nextShift?.shift) {
    const days = differenceInDays(new Date(nextShift.shift.start_time), new Date())
    const hours = differenceInHours(new Date(nextShift.shift.start_time), new Date()) % 24
    nextShiftText = `${nextShift.shift.title} starts in ${days}d ${hours}h`
  }

  // Get available shifts (open shifts not yet at capacity)
  const { data: availableShifts } = await supabase
    .from('shifts')
    .select(
      `
      *,
      shift_signups(count)
    `
    )
    .eq('status', 'open')
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })

  // Filter available shifts to only those not at capacity
  const openShifts =
    availableShifts?.filter((shift: any) => {
      const signupCount = shift.shift_signups?.[0]?.count || 0
      return signupCount < (shift.max_volunteers || 999)
    }) || []

  // Stats calculations
  const totalShifts = mySignups?.length || 0
  const thisMonthShifts =
    mySignups?.filter((s: any) => {
      const shiftMonth = new Date(s.shift.start_time).getMonth()
      return shiftMonth === new Date().getMonth()
    }).length || 0

  // Calculate total hours and hours/month
  const totalHours =
    mySignups?.reduce((acc: number, signup: any) => {
      if (signup.shift?.start_time && signup.shift?.end_time) {
        const hours = differenceInHours(
          new Date(signup.shift.end_time),
          new Date(signup.shift.start_time)
        )
        return acc + hours
      }
      return acc
    }, 0) || 0

  const hoursThisMonth =
    mySignups?.reduce((acc: number, signup: any) => {
      const shiftMonth = new Date(signup.shift.start_time).getMonth()
      if (
        shiftMonth === new Date().getMonth() &&
        signup.shift?.start_time &&
        signup.shift?.end_time
      ) {
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

  const stats = [
    {
      label: 'Total Shifts',
      value: totalShifts,
      icon: TrendingUp,
      color: 'text-primary',
      glow: 'group-hover:shadow-[0_0_20px_hsl(330_100%_60%/0.3)]'
    },
    {
      label: 'This Month',
      value: thisMonthShifts,
      icon: Calendar,
      color: 'text-primary',
      glow: 'group-hover:shadow-[0_0_20px_hsl(330_100%_60%/0.3)]'
    },
    {
      label: 'Total Hours',
      value: totalHours,
      icon: Clock,
      color: 'text-accent-gold',
      glow: 'group-hover:shadow-[0_0_20px_hsl(42_100%_50%/0.3)]'
    },
    {
      label: 'Hours/Month',
      value: hoursThisMonth,
      icon: Clock,
      color: 'text-accent-gold',
      glow: 'group-hover:shadow-[0_0_20px_hsl(42_100%_50%/0.3)]'
    },
    {
      label: 'Upcoming',
      value: mySignups?.length || 0,
      icon: Calendar,
      color: 'text-primary',
      glow: 'group-hover:shadow-[0_0_20px_hsl(330_100%_60%/0.3)]'
    },
    {
      label: 'Available',
      value: openShifts?.length || 0,
      icon: Clock,
      color: 'text-accent-gold',
      glow: 'group-hover:shadow-[0_0_20px_hsl(42_100%_50%/0.3)]'
    },
    {
      label: 'In Play Days',
      value: 1,
      icon: CalendarDays,
      color: 'text-emerald-400',
      glow: 'group-hover:shadow-[0_0_20px_hsl(160_60%_45%/0.3)]'
    }
  ]

  return (
    <div className='space-y-8 pb-16 flex flex-col flex-1 h-full'>
      {/* Header with greeting and view toggle */}
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4 stagger-1'>
        <div>
          <h1 className='text-3xl md:text-4xl font-bold font-display flex items-center gap-3'>
            <Sparkles className='h-8 w-8 text-accent-gold' />
            {greeting}, <span className='text-gradient-primary'>{member?.display_name}</span>!
          </h1>
          {nextShiftText && (
            <p className='text-sm text-muted-foreground mt-2 flex items-center gap-2'>
              <span className='h-2 w-2 rounded-full bg-accent-gold animate-pulse' />
              Your next shift:{' '}
              <span className='text-foreground font-semibold'>{nextShiftText}</span>
            </p>
          )}
        </div>
        <div className='flex gap-1 p-1 glass rounded-lg'>
          <Button
            variant='default'
            size='sm'
            className='bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg glow-primary'>
            <LayoutGrid className='h-4 w-4 mr-2' />
            Cards
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='text-muted-foreground hover:text-foreground hover:bg-white/5'>
            <CalendarDays className='h-4 w-4 mr-2' />
            Calendar
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 stagger-2'>
        {stats.map((stat, i) => (
          <Card
            key={i}
            className={cn(
              'glass group card-lift transition-all duration-300 border-transparent',
              stat.glow
            )}>
            <CardContent className='p-4 flex flex-col items-center justify-center text-center'>
              <stat.icon
                className={cn(
                  'h-5 w-5 mb-2 transition-transform group-hover:scale-110',
                  stat.color
                )}
              />
              <span className='text-2xl font-bold font-display tracking-tight'>{stat.value}</span>
              <p className='text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-1'>
                {stat.label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Latest Announcement */}
      {announcements && announcements.length > 0 && (
        <Card className='glass border-primary/20 bg-primary/5 overflow-hidden stagger-3'>
          <CardContent className='p-0'>
            <div className='p-4 flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div className='flex items-center gap-4'>
                <div className='h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent-gold flex items-center justify-center glow-primary'>
                  <Megaphone className='h-5 w-5 text-white' />
                </div>
                <div>
                  <div className='flex items-center gap-2 mb-0.5'>
                    <span className='text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none'>
                      LATEST ANNOUNCEMENT
                    </span>
                  </div>
                  <h3 className='text-base font-semibold font-display'>{announcements[0].title}</h3>
                </div>
              </div>
              <Button
                asChild
                variant='outline'
                size='sm'
                className='border-primary/30 hover:bg-primary/10 hover:border-primary/50'>
                <Link
                  href='/announcements'
                  className='flex items-center gap-2'>
                  Read more
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shifts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-4'>
        {/* Upcoming Shifts */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between px-1'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-primary' />
              <h2 className='text-xl font-bold font-display'>Confirmed Shifts</h2>
            </div>
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='text-primary hover:text-primary hover:bg-primary/10'>
              <Link
                href='/schedule'
                className='flex items-center gap-1'>
                Explore Full Schedule
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>

          <div className='space-y-3'>
            {mySignups && mySignups.length > 0 ? (
              mySignups.slice(0, 3).map((signup: any) => (
                <Card
                  key={signup.id}
                  className='glass card-lift overflow-hidden border-l-2 border-l-primary'>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between gap-4'>
                      <div className='space-y-1'>
                        <h4 className='font-semibold text-base leading-none font-display'>
                          {signup.shift.title}
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          {format(new Date(signup.shift.start_time), 'EEEE, MMMM d')} •{' '}
                          {format(new Date(signup.shift.start_time), 'h:mm a')}
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='flex items-center justify-end gap-1.5 text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full mb-1'>
                          <Users className='h-3 w-3' />
                          <span>
                            {signup.shift.shift_signups?.[0]?.count || 0}/
                            {signup.shift.max_volunteers || 4}
                          </span>
                        </div>
                        <p className='text-[10px] font-bold text-primary uppercase tracking-wider'>
                          in {differenceInDays(new Date(signup.shift.start_time), new Date())} days
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className='glass border-dashed border-2 border-border/50'>
                <CardContent className='p-12 text-center'>
                  <p className='text-muted-foreground italic'>
                    You haven't signed up for any upcoming shifts.
                  </p>
                  <Button
                    asChild
                    variant='link'
                    className='text-primary mt-2'>
                    <Link href='/schedule'>Browse available shifts</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Available Shifts */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between px-1'>
            <div className='flex items-center gap-2'>
              <Clock className='h-5 w-5 text-accent-gold' />
              <h2 className='text-xl font-bold font-display'>Available Opportunities</h2>
            </div>
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='text-accent-gold hover:text-accent-gold hover:bg-accent-gold/10'>
              <Link
                href='/schedule'
                className='flex items-center gap-1'>
                View All
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>

          <div className='space-y-3'>
            {openShifts && openShifts.length > 0 ? (
              openShifts.slice(0, 3).map((shift: any) => (
                <Card
                  key={shift.id}
                  className='glass card-lift border-l-2 border-l-accent-gold'>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between gap-4'>
                      <div className='space-y-1'>
                        <h4 className='font-semibold text-base leading-none font-display'>
                          {shift.title}
                        </h4>
                        <p className='text-sm text-muted-foreground'>
                          {format(new Date(shift.start_time), 'EEE, MMM d')} •{' '}
                          {format(new Date(shift.start_time), 'h:mm a')}
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='flex items-center justify-end gap-1.5 text-xs font-medium bg-accent-gold/10 text-accent-gold px-2 py-1 rounded-full mb-1'>
                          <Users className='h-3 w-3' />
                          <span>
                            {shift.shift_signups?.[0]?.count || 0}/{shift.max_volunteers || 4}
                          </span>
                        </div>
                        <p className='text-[10px] font-bold text-accent-gold uppercase tracking-wider'>
                          Sign Up Now
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className='glass border-dashed border-2 border-border/50'>
                <CardContent className='p-12 text-center text-muted-foreground'>
                  No open shifts available at the moment.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className='pt-8 mt-auto border-t border-border/30 text-center stagger-5'>
        <p className='text-[10px] font-semibold text-muted-foreground/40 uppercase tracking-[0.3em]'>
          KinkOS by Krysson Consulting © 2026 • v2.0.0
        </p>
      </footer>
    </div>
  )
}
