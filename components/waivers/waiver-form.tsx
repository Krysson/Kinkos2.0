'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWaiverMutation } from '@/hooks/queries/use-waiver-mutation'
import { validateInitials } from '@/lib/member-utils'
import type { Member } from '@/lib/types'
import { FileText, ShieldCheck, AlertCircle } from 'lucide-react'

interface WaiverFormProps {
  member: Member
  onComplete?: () => void
}

export function WaiverForm({ member, onComplete }: WaiverFormProps) {
  const [bylaws, setBylaws] = useState(false)
  const [liability, setLiability] = useState(false)
  const [rules, setRules] = useState(false)
  const [conduct, setConduct] = useState(false)
  const [signature, setSignature] = useState('')
  const [initials, setInitials] = useState('')

  const waiverMutation = useWaiverMutation()

  const isValid =
    bylaws && liability && rules && conduct && signature.length > 2 && initials.length >= 2

  const handleSubmit = async () => {
    if (!isValid) return

    if (member.legal_name && !validateInitials(member.legal_name, initials)) {
      // Warning about initials, but maybe allow it if they really want
    }

    await waiverMutation.mutateAsync({
      member_id: member.id,
      initials,
      signature_svg: signature, // Using typed name as signature for now
      bylaws_agreed: bylaws,
      liability_release_agreed: liability,
      dungeon_rules_agreed: rules,
      code_of_conduct_agreed: conduct
    })

    if (onComplete) onComplete()
  }

  return (
    <Card className='w-full max-w-2xl mx-auto border-primary/20'>
      <CardHeader>
        <div className='flex items-center gap-2 text-primary mb-2'>
          <FileText className='h-5 w-5' />
          <Badge
            variant='outline'
            className='border-primary/30 text-primary'>
            Compliance Required
          </Badge>
        </div>
        <CardTitle>The Woodshed Orlando - Annual Waiver</CardTitle>
        <CardDescription>
          Please review and agree to all terms to maintain your membership eligibility.
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='space-y-4 max-h-[400px] overflow-y-auto pr-2 text-sm text-muted-foreground'>
          <section className='space-y-2'>
            <h3 className='font-semibold text-foreground'>1. Bylaws Agreement</h3>
            <p>
              By checking the box below, I acknowledge that I have read, understand, and agree to
              abide by the Bylaws of The Woodshed Orlando. I understand that failure to comply with
              these bylaws may result in my membership being suspended or revoked.
            </p>
            <div className='flex items-center space-x-2 pt-2'>
              <Checkbox
                id='bylaws'
                checked={bylaws}
                onCheckedChange={v => setBylaws(!!v)}
              />
              <Label
                htmlFor='bylaws'
                className='text-foreground cursor-pointer'>
                I agree to the Bylaws
              </Label>
            </div>
          </section>

          <section className='space-y-2 pt-2 border-t'>
            <h3 className='font-semibold text-foreground'>2. Liability Release</h3>
            <p>
              I hereby release and hold harmless The Woodshed Orlando, its owners, directors,
              officers, agents, and volunteers from any and all liability, claims, demands, or
              causes of action that I may have for injuries or damages arising out of my
              participation in activities at the venue.
            </p>
            <div className='flex items-center space-x-2 pt-2'>
              <Checkbox
                id='liability'
                checked={liability}
                onCheckedChange={v => setLiability(!!v)}
              />
              <Label
                htmlFor='liability'
                className='text-foreground cursor-pointer'>
                I agree to the Liability Release
              </Label>
            </div>
          </section>

          <section className='space-y-2 pt-2 border-t'>
            <h3 className='font-semibold text-foreground'>3. Dungeon Rules & Etiquette</h3>
            <p>
              I agree to follow all posted dungeon rules and maintain proper etiquette at all times.
              I understand that consent is mandatory and non-negotiable. I will respect the
              boundaries of all members and guests.
            </p>
            <div className='flex items-center space-x-2 pt-2'>
              <Checkbox
                id='rules'
                checked={rules}
                onCheckedChange={v => setRules(!!v)}
              />
              <Label
                htmlFor='rules'
                className='text-foreground cursor-pointer'>
                I agree to the Dungeon Rules
              </Label>
            </div>
          </section>

          <section className='space-y-2 pt-2 border-t'>
            <h3 className='font-semibold text-foreground'>4. Code of Conduct</h3>
            <p>
              I agree to the organization's Code of Conduct. I will treat all individuals with
              respect regardless of their race, gender identity, sexual orientation, or experience
              level.
            </p>
            <div className='flex items-center space-x-2 pt-2'>
              <Checkbox
                id='conduct'
                checked={conduct}
                onCheckedChange={v => setConduct(!!v)}
              />
              <Label
                htmlFor='conduct'
                className='text-foreground cursor-pointer'>
                I agree to the Code of Conduct
              </Label>
            </div>
          </section>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t'>
          <div className='md:col-span-2 space-y-2'>
            <Label htmlFor='signature'>Full Legal Name (Digital Signature)</Label>
            <Input
              id='signature'
              placeholder={member.legal_name || 'Your Full Name'}
              value={signature}
              onChange={e => setSignature(e.target.value)}
              className='font-signature italic text-lg' // We should define this in our CSS
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='initials'>Initials</Label>
            <Input
              id='initials'
              placeholder='XX'
              value={initials}
              onChange={e => setInitials(e.target.value.toUpperCase())}
              maxLength={3}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className='flex flex-col gap-4'>
        {!isValid && (
          <div className='flex items-center gap-2 text-xs text-orange-500'>
            <AlertCircle className='h-3 w-3' />
            Please agree to all terms and sign to continue.
          </div>
        )}
        <Button
          className='w-full h-12 text-lg'
          disabled={!isValid || waiverMutation.isPending}
          onClick={handleSubmit}>
          {waiverMutation.isPending ? 'Processing...' : 'Sign & Complete Waiver'}
        </Button>
        <p className='text-[10px] text-center text-muted-foreground w-full'>
          By clicking "Sign & Complete Waiver", you are providing a digital signature that is
          legally binding for one calendar year from {format(new Date(), 'PP')}.
        </p>
      </CardFooter>
    </Card>
  )
}
