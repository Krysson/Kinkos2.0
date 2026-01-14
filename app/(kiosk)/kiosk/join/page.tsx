import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, UserPlus } from 'lucide-react'
import Link from 'next/link'

export default function JoinKioskPage() {
  return (
    <div className='space-y-6 max-w-md mx-auto text-center'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>New Membership</h2>
        <p className='text-muted-foreground'>Join The Woodshed Orlando community today.</p>
      </div>

      <Card className='border-primary/20 bg-primary/5'>
        <CardContent className='pt-6 space-y-4'>
          <UserPlus className='h-12 w-12 mx-auto text-primary' />
          <div className='text-sm text-balance'>
            Please visit the front desk to complete your registration request.
            <br />
            <br />
            Online self-registration coming soon.
          </div>
        </CardContent>
      </Card>

      <div className='pt-4'>
        <Button
          asChild
          variant='outline'>
          <Link href='/kiosk/waiver'>
            Already a member? Sign Waiver <ArrowRight className='ml-2 h-4 w-4' />
          </Link>
        </Button>
      </div>
    </div>
  )
}
