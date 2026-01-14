'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'

export type Shift = {
  id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  capacity: number
  location: string | null
  status: string
  created_at: string
  created_by: string | null
  shift_signups?: Array<{
    id: string
    member_id: string
    cancelled_at: string | null
  }>
}

export type ShiftSignup = {
  id: string
  shift_id: string
  member_id: string
  signed_up_at: string
  cancelled_at: string | null
}

// Get all shifts with signup counts
export function useShifts(filter?: 'all' | 'my-shifts' | 'available') {
  const supabase = createClient()

  return useQuery({
    queryKey: ['shifts', filter],
    queryFn: async () => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get member
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!member) throw new Error('Member not found')

      // Base query
      let query = supabase
        .from('shifts')
        .select(
          `
          *,
          shift_signups!left(
            id,
            member_id,
            cancelled_at
          )
        `
        )
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      const { data: shifts, error } = await query

      if (error) throw error

      // Filter based on filter type
      let filteredShifts = shifts || []

      if (filter === 'my-shifts') {
        filteredShifts = filteredShifts.filter((shift) =>
          shift.shift_signups?.some(
            (signup) => signup.member_id === member.id && !signup.cancelled_at
          )
        )
      } else if (filter === 'available') {
        filteredShifts = filteredShifts.filter((shift) => {
          const activeSignups = shift.shift_signups?.filter((s) => !s.cancelled_at).length || 0
          return activeSignups < shift.capacity
        })
      }

      return filteredShifts
    },
  })
}

// Sign up for a shift
export function useSignUpForShift() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (shiftId: string) => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get member
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!member) throw new Error('Member not found')

      // Check if shift is full
      const { data: shift } = await supabase
        .from('shifts')
        .select(
          `
          *,
          shift_signups!left(id, cancelled_at)
        `
        )
        .eq('id', shiftId)
        .single()

      if (!shift) throw new Error('Shift not found')

      const activeSignups = shift.shift_signups?.filter((s) => !s.cancelled_at).length || 0
      if (activeSignups >= shift.capacity) {
        throw new Error('This shift is full')
      }

      // Check if already signed up
      const { data: existingSignup } = await supabase
        .from('shift_signups')
        .select('*')
        .eq('shift_id', shiftId)
        .eq('member_id', member.id)
        .is('cancelled_at', null)
        .single()

      if (existingSignup) {
        throw new Error('You are already signed up for this shift')
      }

      // Create signup
      const { data, error } = await supabase
        .from('shift_signups')
        .insert({
          shift_id: shiftId,
          member_id: member.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Successfully signed up for shift!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sign up for shift')
    },
  })
}

// Cancel shift signup
export function useCancelShiftSignup() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async (shiftId: string) => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get member
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!member) throw new Error('Member not found')

      // Find the signup
      const { data: signup } = await supabase
        .from('shift_signups')
        .select('*')
        .eq('shift_id', shiftId)
        .eq('member_id', member.id)
        .is('cancelled_at', null)
        .single()

      if (!signup) {
        throw new Error('Signup not found')
      }

      // Mark as cancelled
      const { data, error } = await supabase
        .from('shift_signups')
        .update({ cancelled_at: new Date().toISOString() })
        .eq('id', signup.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Successfully cancelled shift signup')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel shift signup')
    },
  })
}
