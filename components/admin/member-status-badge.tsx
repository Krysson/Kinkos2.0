import { Badge } from '@/components/ui/badge'
import type { MemberStatus } from '@/lib/types'

interface MemberStatusBadgeProps {
  status: MemberStatus
}

export function MemberStatusBadge({ status }: MemberStatusBadgeProps) {
  const variants: Record<MemberStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    active: { variant: 'default', label: 'Active' },
    pending: { variant: 'secondary', label: 'Pending' },
    suspended: { variant: 'destructive', label: 'Suspended' },
    inactive: { variant: 'outline', label: 'Inactive' },
  }

  const config = variants[status] || variants.pending

  return <Badge variant={config.variant}>{config.label}</Badge>
}
