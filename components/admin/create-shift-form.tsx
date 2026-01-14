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
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle } from 'lucide-react'

const shiftSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
  start_date: z.string().min(1, 'Start date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  max_volunteers: z.number().min(1, 'Must have at least 1 volunteer spot'),
  min_volunteers: z.number().min(1, 'Must have at least 1 minimum volunteer'),
})

type ShiftFormData = z.infer<typeof shiftSchema>

export function CreateShiftForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      location: 'The Woodshed Orlando',
      min_volunteers: 1,
      max_volunteers: 5,
    },
  })

  const onSubmit = async (data: ShiftFormData) => {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in')
      setLoading(false)
      return
    }

    // Get member ID
    const { data: member } = await supabase.from('members').select('id').eq('auth_id', user.id).single()

    if (!member) {
      setError('Member not found')
      setLoading(false)
      return
    }

    // Combine date and time
    const startDateTime = new Date(`${data.start_date}T${data.start_time}`)
    const endDateTime = new Date(`${data.start_date}T${data.end_time}`)

    const { error: insertError } = await supabase.from('shifts').insert({
      title: data.title,
      description: data.description,
      location: data.location,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      min_volunteers: data.min_volunteers,
      max_volunteers: data.max_volunteers,
      status: 'open',
      created_by: member.id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/shifts')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Shift Title</Label>
        <Input id="title" placeholder="e.g. Setup Crew, Door Staff" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea id="description" placeholder="What will volunteers be doing?" {...register('description')} />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" {...register('location')} />
        {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Date</Label>
          <Input id="start_date" type="date" {...register('start_date')} />
          {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="start_time">Start Time</Label>
          <Input id="start_time" type="time" {...register('start_time')} />
          {errors.start_time && <p className="text-sm text-destructive">{errors.start_time.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="end_time">End Time</Label>
          <Input id="end_time" type="time" {...register('end_time')} />
          {errors.end_time && <p className="text-sm text-destructive">{errors.end_time.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="min_volunteers">Min Volunteers</Label>
          <Input
            id="min_volunteers"
            type="number"
            min="1"
            {...register('min_volunteers', { valueAsNumber: true })}
          />
          {errors.min_volunteers && <p className="text-sm text-destructive">{errors.min_volunteers.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max_volunteers">Max Volunteers</Label>
          <Input
            id="max_volunteers"
            type="number"
            min="1"
            {...register('max_volunteers', { valueAsNumber: true })}
          />
          {errors.max_volunteers && <p className="text-sm text-destructive">{errors.max_volunteers.message}</p>}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" className="bg-accent-magenta hover:bg-accent-magenta/90" disabled={loading}>
          {loading ? 'Creating...' : 'Create Shift'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
