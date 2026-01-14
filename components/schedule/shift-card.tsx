'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { useSignUpForShift, useCancelShiftSignup, type Shift } from '@/hooks/queries/use-shifts'
import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

type ShiftCardProps = {
  shift: Shift
}

export function ShiftCard({ shift }: ShiftCardProps) {
  const signUpMutation = useSignUpForShift()
  const cancelMutation = useCancelShiftSignup()
  const [isSignedUp, setIsSignedUp] = useState(false)
  const [memberId, setMemberId] = useState<string | null>(null)

  const activeSignups = shift.shift_signups?.filter((s) => !s.cancelled_at).length || 0
  const spotsRemaining = shift.capacity - activeSignups
  const isFull = spotsRemaining <= 0

  useEffect(() => {
    async function checkSignup() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!member) return

      setMemberId(member.id)

      const signedUp = shift.shift_signups?.some(
        (signup) => signup.member_id === member.id && !signup.cancelled_at
      )
      setIsSignedUp(!!signedUp)
    }

    checkSignup()
  }, [shift.shift_signups])

  const handleSignUp = () => {
    signUpMutation.mutate(shift.id)
  }

  const handleCancel = () => {
    cancelMutation.mutate(shift.id)
  }

  return (
    <Card className={isSignedUp ? 'border-accent-teal' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{shift.title}</CardTitle>
            {shift.description && (
              <CardDescription className="text-sm">{shift.description}</CardDescription>
            )}
          </div>
          {isSignedUp && (
            <Badge className="bg-accent-teal text-black hover:bg-accent-teal/90">Signed Up</Badge>
          )}
          {isFull && !isSignedUp && (
            <Badge variant="destructive">Full</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(new Date(shift.start_time), 'PPP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(shift.start_time), 'p')} -{' '}
                {format(new Date(shift.end_time), 'p')}
              </span>
            </div>
            {shift.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{shift.location}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {spotsRemaining} {spotsRemaining === 1 ? 'spot' : 'spots'} remaining ({activeSignups}/
              {shift.capacity})
            </span>
          </div>

          <div className="pt-2">
            {isSignedUp ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Signup'}
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleSignUp}
                disabled={isFull || signUpMutation.isPending}
              >
                {signUpMutation.isPending ? 'Signing Up...' : isFull ? 'Shift Full' : 'Sign Up'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
