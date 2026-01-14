'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { MemberRole } from '@/lib/types'

interface MemberRoleSelectProps {
  memberId: string
  currentRole: MemberRole
}

export function MemberRoleSelect({ memberId, currentRole }: MemberRoleSelectProps) {
  const [role, setRole] = useState<MemberRole>(currentRole)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRoleChange = async (newRole: MemberRole) => {
    setLoading(true)
    const supabase = createClient()

    const { error } = await supabase.from('members').update({ role: newRole }).eq('id', memberId)

    if (error) {
      console.error('Error updating role:', error)
      alert('Failed to update role: ' + error.message)
    } else {
      setRole(newRole)
      router.refresh()
    }

    setLoading(false)
  }

  return (
    <Select value={role} onValueChange={handleRoleChange} disabled={loading}>
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="member">Member</SelectItem>
        <SelectItem value="volunteer">Volunteer</SelectItem>
        <SelectItem value="lead">Lead</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="owner">Owner</SelectItem>
      </SelectContent>
    </Select>
  )
}
