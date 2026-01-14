'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useCheckInMutation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      member_id,
      check_in_type = 'social_visit',
      checked_in_by,
      counts_toward_capacity = true
    }: {
      member_id: string
      check_in_type?: string
      checked_in_by?: string
      counts_toward_capacity?: boolean
    }) => {
      const { data, error } = await supabase
        .from('check_ins')
        .insert({
          member_id,
          check_in_type,
          checked_in_by,
          counts_toward_capacity,
          check_in_time: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-ins'] })
      queryClient.invalidateQueries({ queryKey: ['occupancy'] })
      toast.success('Member checked in successfully')
    },
    onError: (error: any) => {
      toast.error('Check-in failed: ' + error.message)
    }
  })
}

export function useCheckOutMutation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      check_in_id,
      checked_out_by
    }: {
      check_in_id: string
      checked_out_by?: string
    }) => {
      const { data, error } = await supabase
        .from('check_ins')
        .update({
          check_out_time: new Date().toISOString(),
          checked_out_by
        })
        .eq('id', check_in_id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['check-ins'] })
      queryClient.invalidateQueries({ queryKey: ['occupancy'] })
      toast.success('Member checked out successfully')
    },
    onError: (error: any) => {
      toast.error('Check-out failed: ' + error.message)
    }
  })
}
