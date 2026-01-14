import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateShiftForm } from '@/components/admin/create-shift-form'

export default function CreateShiftPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create New Shift</h2>
        <p className="text-muted-foreground">Schedule a new volunteer shift</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shift Details</CardTitle>
          <CardDescription>Enter the information for the new shift</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateShiftForm />
        </CardContent>
      </Card>
    </div>
  )
}
