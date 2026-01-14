'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Search,
  UserCheck,
  UserX,
  Users,
  AlertTriangle,
  Loader2,
  FileSignature
} from 'lucide-react'
import { useMembers, useCheckIns, useCurrentOccupancy } from '@/hooks/queries/use-members'
import { useCheckInMutation, useCheckOutMutation } from '@/hooks/queries/use-check-ins-mutations'
import { format, isAfter } from 'date-fns'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { WaiverForm } from '@/components/waivers/waiver-form'
import type { Member } from '@/lib/types'

const MAX_CAPACITY = 140

export function CheckInDashboard({ userId }: { userId: string }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [waiverDialogOpen, setWaiverDialogOpen] = useState(false)

  // Queries
  const { data: members, isLoading: membersLoading } = useMembers(searchQuery)
  const { data: activeCheckIns, isLoading: checkInsLoading } = useCheckIns()
  const { data: occupancy = 0 } = useCurrentOccupancy()

  // Mutations
  const checkInMutation = useCheckInMutation()
  const checkOutMutation = useCheckOutMutation()

  const handleCheckIn = (member: Member) => {
    // Check for valid waiver
    const hasValidWaiver = member.waivers?.some((w: any) =>
      isAfter(new Date(w.valid_until), new Date())
    )

    if (!hasValidWaiver) {
      setSelectedMember(member)
      setWaiverDialogOpen(true)
      return
    }

    checkInMutation.mutate({
      member_id: member.id,
      checked_in_by: userId
    })
  }

  const handleCheckOut = (checkInId: string) => {
    checkOutMutation.mutate({
      check_in_id: checkInId,
      checked_out_by: userId
    })
  }

  const isCheckedIn = (memberId: string) => {
    return activeCheckIns?.some(ci => ci.member_id === memberId)
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='col-span-1 border-primary/20'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium flex items-center gap-2'>
              <Users className='h-4 w-4' /> Current Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-2'>
              <span className='text-4xl font-bold'>{occupancy}</span>
              <span className='text-muted-foreground'>/ {MAX_CAPACITY}</span>
            </div>
            {occupancy >= MAX_CAPACITY * 0.9 && (
              <Alert
                variant='destructive'
                className='mt-4 py-2'>
                <AlertTriangle className='h-4 w-4' />
                <AlertDescription className='text-xs'>
                  Venue is approaching maximum capacity.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card className='md:col-span-2'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium'>Search Member</CardTitle>
            <CardDescription>Search by name or email to check in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search name, scene name, or email...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Member Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border min-h-[400px]'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Waiver</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {membersLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='h-24 text-center'>
                        <Loader2 className='h-6 w-6 animate-spin mx-auto' />
                      </TableCell>
                    </TableRow>
                  ) : members && members.length > 0 ? (
                    members.map(member => {
                      const alreadyIn = isCheckedIn(member.id)
                      const hasValidWaiver = member.waivers?.some((w: any) =>
                        isAfter(new Date(w.valid_until), new Date())
                      )

                      return (
                        <TableRow key={member.id}>
                          <TableCell>
                            <div className='font-medium'>{member.display_name}</div>
                            <div className='text-xs text-muted-foreground'>{member.email}</div>
                          </TableCell>
                          <TableCell>
                            {hasValidWaiver ? (
                              <Badge
                                variant='outline'
                                className='text-green-500 border-green-500/30'>
                                Valid
                              </Badge>
                            ) : (
                              <Badge
                                variant='destructive'
                                className='bg-destructive/10 text-destructive border-destructive/20'>
                                Expired/None
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className='text-right'>
                            {alreadyIn ? (
                              <Button
                                variant='ghost'
                                size='sm'
                                disabled>
                                Already In
                              </Button>
                            ) : hasValidWaiver ? (
                              <Button
                                size='sm'
                                onClick={() => handleCheckIn(member)}
                                disabled={checkInMutation.isPending}>
                                Check In
                              </Button>
                            ) : (
                              <Button
                                size='sm'
                                variant='outline'
                                onClick={() => handleCheckIn(member)}
                                className='border-primary/50 text-primary hover:bg-primary/10'>
                                <FileSignature className='h-4 w-4 mr-2' />
                                Sign Waiver
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className='h-24 text-center text-muted-foreground'>
                        {searchQuery ? 'No members found.' : 'Type to search members.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className='border-primary/10'>
          <CardHeader>
            <CardTitle>Active Check-Ins ({activeCheckIns?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='rounded-md border min-h-[400px]'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead className='text-right'>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkInsLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className='h-24 text-center'>
                        <Loader2 className='h-6 w-6 animate-spin mx-auto' />
                      </TableCell>
                    </TableRow>
                  ) : activeCheckIns && activeCheckIns.length > 0 ? (
                    activeCheckIns.map((ci: any) => (
                      <TableRow key={ci.id}>
                        <TableCell>
                          <div className='font-medium'>{ci.member?.display_name}</div>
                          <Badge
                            variant='secondary'
                            className='text-[10px] h-4'>
                            {ci.check_in_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-sm'>
                          {format(new Date(ci.check_in_time), 'h:mm a')}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => handleCheckOut(ci.id)}
                            disabled={checkOutMutation.isPending}>
                            Check Out
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className='h-24 text-center text-muted-foreground'>
                        No active check-ins.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={waiverDialogOpen}
        onOpenChange={setWaiverDialogOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Member Waiver - Required</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <WaiverForm
              member={selectedMember}
              onComplete={() => {
                setWaiverDialogOpen(false)
                // Auto check-in after signing? Maybe later.
                // For now just refresh.
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
