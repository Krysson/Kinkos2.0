import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ShiftList } from '@/components/admin/shift-list'
import Link from 'next/link'

export default async function AdminShiftsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: shifts } = await supabase
    .from('shifts')
    .select(
      `
      *,
      signups:shift_signups(count)
    `
    )
    .gte('start_time', new Date().toISOString())
    .order('start_time', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Shift Management</h2>
          <p className="text-muted-foreground">Create and manage volunteer shifts</p>
        </div>
        <Button asChild className="bg-accent-magenta hover:bg-accent-magenta/90">
          <Link href="/admin/shifts/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Shift
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Shifts</CardTitle>
          <CardDescription>All scheduled shifts starting from today</CardDescription>
        </CardHeader>
        <CardContent>
          {shifts && shifts.length > 0 ? (
            <ShiftList shifts={shifts} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No upcoming shifts. Create your first shift to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
