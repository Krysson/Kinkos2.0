import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, RotateCw } from 'lucide-react'

export default function RenewalKioskPage() {
  return (
    <div className='space-y-6 max-w-md mx-auto text-center'>
      <div className='space-y-2'>
        <h2 className='text-2xl font-bold'>Membership Renewal</h2>
        <p className='text-muted-foreground'>Extend your membership.</p>
      </div>

      <Card className='border-accent-gold/20 bg-accent-gold/5'>
        <CardContent className='pt-6 space-y-4'>
          <RotateCw className='h-12 w-12 mx-auto text-accent-gold' />
          <div className='text-sm text-balance'>
            Please see a staff member to process your renewal payment.
            <br />
            <br />
            Self-service renewals coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
