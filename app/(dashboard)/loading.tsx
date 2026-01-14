import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-10 w-64' />
        <Skeleton className='h-4 w-96' />
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
        <Skeleton className='h-32 rounded-xl' />
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Skeleton className='h-[400px] rounded-xl' />
        <Skeleton className='h-[400px] rounded-xl' />
      </div>
    </div>
  )
}
