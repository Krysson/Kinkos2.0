import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { MemberRoleSelect } from '@/components/admin/member-role-select'
import { MemberStatusBadge } from '@/components/admin/member-status-badge'
import { format } from 'date-fns'

export default async function AdminMembersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Member Management</CardTitle>
          <CardDescription>View and manage all members, assign roles, and update statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Display Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.display_name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <MemberRoleSelect memberId={member.id} currentRole={member.role} />
                    </TableCell>
                    <TableCell>
                      <MemberStatusBadge status={member.status} />
                    </TableCell>
                    <TableCell>
                      {member.member_since ? format(new Date(member.member_since), 'PP') : 'Not set'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(member.created_at), 'PP')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!members || members.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No members found</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
