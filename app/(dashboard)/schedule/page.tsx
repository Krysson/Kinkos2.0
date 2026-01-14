'use client'

import { useState } from 'react'
import { useShifts } from '@/hooks/queries/use-shifts'
import { ShiftCard } from '@/components/schedule/shift-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Filter } from 'lucide-react'

type FilterType = 'all' | 'my-shifts' | 'available'

export default function SchedulePage() {
  const [filter, setFilter] = useState<FilterType>('all')
  const { data: shifts, isLoading, error } = useShifts(filter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Calendar className="h-8 w-8 text-accent-magenta" />
          Schedule
        </h1>
        <p className="text-muted-foreground mt-2">View and sign up for upcoming shifts</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Shifts
          </CardTitle>
          <CardDescription>Show shifts that match your criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All Shifts
            </Button>
            <Button
              variant={filter === 'my-shifts' ? 'default' : 'outline'}
              onClick={() => setFilter('my-shifts')}
              size="sm"
            >
              My Shifts
            </Button>
            <Button
              variant={filter === 'available' ? 'default' : 'outline'}
              onClick={() => setFilter('available')}
              size="sm"
            >
              Available
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Shifts List */}
      <div className="space-y-4">
        {isLoading && (
          <>
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-center text-destructive">Error loading shifts: {error.message}</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && shifts && shifts.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                {filter === 'my-shifts'
                  ? "You haven't signed up for any shifts yet."
                  : filter === 'available'
                    ? 'No available shifts at the moment.'
                    : 'No upcoming shifts scheduled.'}
              </p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && shifts && shifts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {shifts.map((shift) => (
              <ShiftCard key={shift.id} shift={shift} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
