export default function KioskLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-background text-foreground atmosphere relative noise-overlay flex flex-col items-center justify-center p-4'>
      <div className='w-full max-w-4xl space-y-8'>
        <div className='text-center space-y-2'>
          <h1 className='text-4xl font-bold font-display text-gradient-primary'>
            The Woodshed Orlando
          </h1>
          <p className='text-xl text-muted-foreground'>Kiosk Mode</p>
        </div>

        <div className='bg-card border border-border/50 rounded-xl shadow-2xl p-6 md:p-8 backdrop-blur-sm'>
          {children}
        </div>

        <div className='text-center text-xs text-muted-foreground opacity-50'>
          &copy; {new Date().getFullYear()} KinkOS 2.0
        </div>
      </div>
    </div>
  )
}
