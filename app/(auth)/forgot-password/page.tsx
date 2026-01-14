'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Reset Password</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-accent-teal/10 border border-accent-teal/30 rounded-md p-3 flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-accent-teal mt-0.5" />
            <p className="text-sm text-accent-teal">
              Password reset email sent! Check your inbox and follow the link to reset your password.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="your@email.com" {...register('email')} disabled={success} />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-accent-magenta hover:bg-accent-magenta/90"
          disabled={loading || success}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Remember your password?{' '}
        <Link href="/login" className="text-accent-magenta hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
