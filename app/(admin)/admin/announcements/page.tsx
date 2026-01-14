import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateAnnouncementForm } from '@/components/admin/create-announcement-form'

export default function AdminAnnouncementsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create Announcement</h2>
        <p className="text-muted-foreground">Post an announcement for members to see</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcement Details</CardTitle>
          <CardDescription>Create a new announcement for the community</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAnnouncementForm />
        </CardContent>
      </Card>
    </div>
  )
}
