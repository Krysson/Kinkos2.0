export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-accent-magenta">The Woodshed Orlando</h1>
          <p className="text-muted-foreground mt-2">Venue Management System</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6 shadow-lg">{children}</div>
      </div>
    </div>
  );
}
