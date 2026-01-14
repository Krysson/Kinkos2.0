'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WaiverForm } from '@/components/waivers/waiver-form'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { Member } from '@/lib/types'
import { Search, RotateCcw } from 'lucide-react'

export default function WaiverKioskPage() {
  const [email, setEmail] = useState('')
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    if (!email) return
    setLoading(true)
    const supabase = createClient()

    // Lookup by email
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .ilike('email', email)
      .maybeSingle()

    if (error) {
      toast.error('Error finding member: ' + error.message)
    } else if (!data) {
      toast.error('No member found with that email.')
    } else {
      setMember(data)
    }
    setLoading(false)
  }

  const handleReset = () => {
    setMember(null)
    setEmail('')
  }

  if (member) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-between items-center bg-muted/20 p-4 rounded-lg'>
          <div className='text-sm'>
            Signing for: <span className='font-bold'>{member.display_name}</span> ({member.email})
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={handleReset}>
            <RotateCcw className='h-4 w-4 mr-2' />
            Start Over
          </Button>
        </div>
        <WaiverForm
          member={member}
          onComplete={() => {
            toast.success('Waiver signed! Thank you.')
            setTimeout(handleReset, 3000)
          }}
        />
      </div>
    )
  }

  return (
    <div className='space-y-6 max-w-md mx-auto'>
      <div className='text-center space-y-2'>
        <h2 className='text-2xl font-bold'>Digital Waiver Kiosk</h2>
        <p className='text-muted-foreground'>
          Enter your email address to locate your membership and sign the annual waiver.
        </p>
      </div>

      <div className='flex flex-col gap-4'>
        <div className='space-y-2'>
          <Input
            type='email'
            placeholder='name@example.com'
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            className='h-12 text-lg'
          />
        </div>
        <Button
          size='lg'
          onClick={handleLookup}
          disabled={loading || !email}>
          {loading ? 'Searching...' : 'Find Information'} <Search className='ml-2 h-4 w-4' />
        </Button>
      </div>

      <p className='text-center text-sm text-muted-foreground pt-4'>
        Not a member yet? Please visit the Registration Kiosk.
      </p>
    </div>
  )
}
