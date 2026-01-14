'use client'

import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash2 } from 'lucide-react'
import type { ShiftWithSignups } from '@/lib/types'

interface ShiftListProps {
  shifts: (ShiftWithSignups & { signups?: Array<{ count: number }> })[]
}

export function ShiftList({ shifts }: ShiftListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Signups</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shifts.map((shift) => {
            const signupCount = shift.signups?.[0]?.count || 0
            const isFull = signupCount >= shift.max_volunteers

            return (
              <TableRow key={shift.id}>
                <TableCell className="font-medium">{shift.title}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(shift.start_time), 'PPP')}</div>
                    <div className="text-muted-foreground">
                      {format(new Date(shift.start_time), 'p')} - {format(new Date(shift.end_time), 'p')}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{shift.location}</TableCell>
                <TableCell>
                  <span className={isFull ? 'text-accent-magenta font-semibold' : ''}>
                    {signupCount} / {shift.max_volunteers}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={shift.status === 'open' ? 'default' : 'secondary'}>{shift.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
