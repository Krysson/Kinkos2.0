import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Megaphone } from 'lucide-react'
import { format } from 'date-fns'

export default async function AnnouncementsPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: member } = await supabase.from('members').select('id').eq('auth_id', user?.id).single()

  // Get all announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .lte('publish_at', new Date().toISOString())
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  // Get read announcements for current member
  const { data: reads } = await supabase
    .from('announcement_reads')
    .select('announcement_id')
    .eq('member_id', member?.id || '')

  const readIds = new Set(reads?.map((r) => r.announcement_id) || [])

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-accent-magenta',
    normal: 'bg-accent-teal',
    low: 'bg-muted',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Megaphone className="h-8 w-8 text-accent-magenta" />
          Announcements
        </h1>
        <p className="text-muted-foreground mt-2">Stay updated with the latest news and information</p>
      </div>

      <div className="space-y-4">
        {announcements?.map((announcement) => {
          const isRead = readIds.has(announcement.id)

          return (
            <Card key={announcement.id} className={isRead ? 'opacity-75' : 'border-accent-magenta'}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className={isRead ? 'text-muted-foreground' : ''}>{announcement.title}</CardTitle>
                      {!isRead && (
                        <Badge variant="secondary" className="text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge className={priorityColors[announcement.priority]}>{announcement.priority}</Badge>
                      <span>•</span>
                      <span>{format(new Date(announcement.created_at), 'PPP')}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          )
        })}

        {!announcements || announcements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              No announcements at this time. Check back later for updates.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
