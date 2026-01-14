import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: member } = await supabase.from('members').select('*').eq('auth_id', user?.id).single()

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Member profile not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8 text-accent-magenta" />
          My Profile
        </h1>
        <p className="text-muted-foreground mt-2">Manage your account information and privacy settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information and contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm member={member} />
        </CardContent>
      </Card>
    </div>
  )
}
