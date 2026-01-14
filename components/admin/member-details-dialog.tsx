'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Member } from '@/lib/types'
import { User, Phone, Mail, Heart, Calendar, Shield } from 'lucide-react'
import { format } from 'date-fns'

interface MemberDetailsDialogProps {
  member: Member
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MemberDetailsDialog({ member, open, onOpenChange }: MemberDetailsDialogProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form states
  const [displayName, setDisplayName] = useState(member.display_name)
  const [legalName, setLegalName] = useState(member.legal_name || '')
  const [pronouns, setPronouns] = useState(member.pronouns || '')
  const [phone, setPhone] = useState(member.phone || '')
  const [bio, setBio] = useState(member.bio || '')
  const [emergencyName, setEmergencyName] = useState(member.emergency_contact_name || '')
  const [emergencyPhone, setEmergencyPhone] = useState(member.emergency_contact_phone || '')
  const [emergencyRel, setEmergencyRel] = useState(member.emergency_contact_relationship || '')

  const handleUpdate = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('members')
      .update({
        display_name: displayName,
        legal_name: legalName,
        pronouns: pronouns,
        phone: phone,
        bio: bio,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
        emergency_contact_relationship: emergencyRel,
        updated_at: new Date().toISOString()
      })
      .eq('id', member.id)

    if (error) {
      toast.error('Failed to update member: ' + error.message)
    } else {
      toast.success('Member updated successfully')
      router.refresh()
      onOpenChange(false)
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Member Details</DialogTitle>
          <DialogDescription>
            View and edit profile information for {member.display_name}
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-6 py-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-4'>
              <h3 className='text-sm font-medium flex items-center gap-2 text-primary'>
                <User className='h-4 w-4' /> Personal Info
              </h3>
              <div className='space-y-2'>
                <Label htmlFor='displayName'>Display Name</Label>
                <Input
                  id='displayName'
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='legalName'>Legal Name</Label>
                <Input
                  id='legalName'
                  value={legalName}
                  onChange={e => setLegalName(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='pronouns'>Pronouns</Label>
                <Input
                  id='pronouns'
                  value={pronouns}
                  onChange={e => setPronouns(e.target.value)}
                />
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-medium flex items-center gap-2 text-primary'>
                <Phone className='h-4 w-4' /> Contact Info
              </h3>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  value={member.email}
                  disabled
                />
                <p className='text-[10px] text-muted-foreground italic'>
                  Email cannot be changed here
                </p>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className='mt-6 p-3 bg-secondary/20 rounded-lg space-y-1'>
                <div className='flex items-center gap-2 text-xs font-semibold'>
                  <Shield className='h-3 w-3' /> System Role
                </div>
                <p className='text-xs capitalize'>{member.role}</p>
                <div className='flex items-center gap-2 text-xs font-semibold mt-2'>
                  <Calendar className='h-3 w-3' /> Member Since
                </div>
                <p className='text-xs'>
                  {member.member_since ? format(new Date(member.member_since), 'PP') : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-2 text-sm pt-2 border-t'>
            <h3 className='text-sm font-medium flex items-center gap-2 text-primary'>
              <Heart className='h-4 w-4' /> Emergency Contact
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='eName'>Contact Name</Label>
                <Input
                  id='eName'
                  value={emergencyName}
                  onChange={e => setEmergencyName(e.target.value)}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='ePhone'>Contact Phone</Label>
                <Input
                  id='ePhone'
                  value={emergencyPhone}
                  onChange={e => setEmergencyPhone(e.target.value)}
                />
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='eRel'>Relationship</Label>
              <Input
                id='eRel'
                value={emergencyRel}
                onChange={e => setEmergencyRel(e.target.value)}
              />
            </div>
          </div>

          <div className='space-y-2 pt-2 border-t'>
            <Label htmlFor='bio'>Bio / Notes</Label>
            <Textarea
              id='bio'
              rows={3}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder='Add any relevant notes or member bio here...'
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
