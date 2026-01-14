'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Member } from '@/lib/types'

export function useMembers(searchQuery?: string) {
  return useQuery({
    queryKey: ['members', searchQuery],
    queryFn: async () => {
      const supabase = createClient()
      let query = supabase
        .from('members')
        .select(
          `
          *,
          waivers(id, valid_until)
        `
        )
        .order('display_name', { ascending: true })

      if (searchQuery) {
        query = query.or(
          `display_name.ilike.%${searchQuery}%,legal_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`
        )
      }

      const { data, error } = await query.limit(50)
      if (error) throw error
      return data as (Member & { waivers: { id: string; valid_until: string }[] })[]
    },
    enabled: true
  })
}

export function useMemberWaiver(memberId: string) {
  return useQuery({
    queryKey: ['waiver', memberId],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('waivers')
        .select('*')
        .eq('member_id', memberId)
        .gte('valid_until', new Date().toISOString())
        .maybeSingle()

      if (error) throw error
      return data
    },
    enabled: !!memberId
  })
}

export function useCheckIns() {
  return useQuery({
    queryKey: ['check-ins', 'active'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('check_ins')
        .select('*, member:members(*)')
        .is('check_out_time', null)
        .order('check_in_time', { ascending: false })

      if (error) throw error
      return data
    }
  })
}

export function useCurrentOccupancy() {
  return useQuery({
    queryKey: ['occupancy'],
    queryFn: async () => {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_current_occupancy')
      if (error) throw error
      return data as number
    }
  })
}
