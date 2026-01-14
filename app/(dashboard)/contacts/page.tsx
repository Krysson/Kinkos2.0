import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Phone } from 'lucide-react'

export default async function ContactsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: members } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'active')
    .eq('show_in_contacts', true)
    .order('display_name')

  const roleColors: Record<string, string> = {
    owner: 'bg-red-500',
    admin: 'bg-accent-magenta',
    lead: 'bg-accent-teal',
    volunteer: 'bg-blue-500',
    member: 'bg-muted',
  }

  const roleLabels: Record<string, string> = {
    owner: 'Owner',
    admin: 'Admin',
    lead: 'Lead',
    volunteer: 'Volunteer',
    member: 'Member',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8 text-accent-teal" />
          Contacts
        </h1>
        <p className="text-muted-foreground mt-2">Connect with other members and volunteers</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Member Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Pronouns</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.display_name}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[member.role]}>{roleLabels[member.role]}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{member.pronouns || '—'}</TableCell>
                    <TableCell>
                      {member.show_email ? (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex items-center gap-1 text-accent-magenta hover:underline"
                        >
                          <Mail className="h-4 w-4" />
                          {member.email}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Hidden</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {member.show_phone && member.phone ? (
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-1 text-accent-magenta hover:underline"
                        >
                          <Phone className="h-4 w-4" />
                          {member.phone}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">Hidden</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {!members || members.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No contacts available.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
