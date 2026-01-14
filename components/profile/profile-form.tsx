'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import type { Member } from '@/lib/types'

const profileSchema = z.object({
  display_name: z.string().min(2, 'Display name must be at least 2 characters'),
  legal_name: z.string().optional(),
  pronouns: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relationship: z.string().optional(),
  show_in_contacts: z.boolean(),
  show_phone: z.boolean(),
  show_email: z.boolean(),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
  member: Member
}

export function ProfileForm({ member }: ProfileFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showInContacts, setShowInContacts] = useState(member.show_in_contacts)
  const [showPhone, setShowPhone] = useState(member.show_phone)
  const [showEmail, setShowEmail] = useState(member.show_email)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: member.display_name,
      legal_name: member.legal_name || '',
      pronouns: member.pronouns || '',
      phone: member.phone || '',
      bio: member.bio || '',
      emergency_contact_name: member.emergency_contact_name || '',
      emergency_contact_phone: member.emergency_contact_phone || '',
      emergency_contact_relationship: member.emergency_contact_relationship || '',
      show_in_contacts: member.show_in_contacts,
      show_phone: member.show_phone,
      show_email: member.show_email,
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    const { error: updateError } = await supabase
      .from('members')
      .update({
        display_name: data.display_name,
        legal_name: data.legal_name || null,
        pronouns: data.pronouns || null,
        phone: data.phone || null,
        bio: data.bio || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        emergency_contact_relationship: data.emergency_contact_relationship || null,
        show_in_contacts: showInContacts,
        show_phone: showPhone,
        show_email: showEmail,
      })
      .eq('id', member.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    router.refresh()

    setTimeout(() => {
      setSuccess(false)
    }, 3000)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
          <p className="text-sm text-green-500">Profile updated successfully!</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="space-y-2">
          <Label htmlFor="display_name">Display Name (Scene Name)</Label>
          <Input id="display_name" {...register('display_name')} />
          {errors.display_name && <p className="text-sm text-destructive">{errors.display_name.message}</p>}
          <p className="text-xs text-muted-foreground">This is how you'll appear to other members</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="legal_name">Legal Name (Optional)</Label>
          <Input id="legal_name" {...register('legal_name')} />
          <p className="text-xs text-muted-foreground">For administrative purposes only</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pronouns">Pronouns (Optional)</Label>
            <Input id="pronouns" placeholder="e.g. they/them" {...register('pronouns')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input id="phone" type="tel" {...register('phone')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={member.email} disabled />
          <p className="text-xs text-muted-foreground">Email cannot be changed. Contact an admin if needed.</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Emergency Contact</h3>

        <div className="space-y-2">
          <Label htmlFor="emergency_contact_name">Contact Name</Label>
          <Input id="emergency_contact_name" {...register('emergency_contact_name')} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input id="emergency_contact_phone" type="tel" {...register('emergency_contact_phone')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_relationship">Relationship</Label>
            <Input
              id="emergency_contact_relationship"
              placeholder="e.g. Partner, Friend"
              {...register('emergency_contact_relationship')}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Privacy Settings</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_in_contacts">Show in directory</Label>
              <p className="text-sm text-muted-foreground">Appear in the member contacts list</p>
            </div>
            <Switch id="show_in_contacts" checked={showInContacts} onCheckedChange={setShowInContacts} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_email">Show email</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your email address</p>
            </div>
            <Switch id="show_email" checked={showEmail} onCheckedChange={setShowEmail} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="show_phone">Show phone</Label>
              <p className="text-sm text-muted-foreground">Allow others to see your phone number</p>
            </div>
            <Switch id="show_phone" checked={showPhone} onCheckedChange={setShowPhone} />
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="bg-accent-magenta hover:bg-accent-magenta/90" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
