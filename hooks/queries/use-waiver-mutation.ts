'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { addYears } from 'date-fns'

export function useWaiverMutation() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      member_id,
      initials,
      signature_svg,
      bylaws_agreed,
      liability_release_agreed,
      dungeon_rules_agreed,
      code_of_conduct_agreed
    }: {
      member_id: string
      initials: string
      signature_svg: string
      bylaws_agreed: boolean
      liability_release_agreed: boolean
      dungeon_rules_agreed: boolean
      code_of_conduct_agreed: boolean
    }) => {
      const signedDate = new Date()
      const validUntil = addYears(signedDate, 1)

      const { data, error } = await supabase
        .from('waivers')
        .insert({
          member_id,
          initials,
          signature_svg,
          bylaws_agreed,
          liability_release_agreed,
          dungeon_rules_agreed,
          code_of_conduct_agreed,
          signed_date: signedDate.toISOString(),
          valid_until: validUntil.toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update member status to active if pending
      await supabase
        .from('members')
        .update({ status: 'active' })
        .eq('id', member_id)
        .eq('status', 'pending')

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waivers'] })
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success('Waiver signed successfully!')
    },
    onError: (error: any) => {
      toast.error('Failed to sign waiver: ' + error.message)
    }
  })
}
