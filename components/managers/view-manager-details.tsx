import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PhoneCall, Users, BarChart, ClipboardList } from "lucide-react"

interface ViewManagerDetailsProps {
  manager: {
    id: string
    employeeId: string
    name: string
    email: string
    status: string
    performance: {
      leads: number
      conversions: number
      conversionRate: number
    }
    telecallers: Array<{
      id: string
      name: string
      employeeId: string
      status: string
    }>
    tasks: Array<{
      id: string
      title: string
      status: string
      dueDate: string
    }>
  }
  open: boolean
  onClose: () => void
}

export function ViewManagerDetails({ manager, open, onClose }: ViewManagerDetailsProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manager Details</DialogTitle>
        </DialogHeader>
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Employee ID</h3>
              <p className="mt-1">{manager.employeeId}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  manager.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {manager.status}
                </span>
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1">{manager.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1">{manager.email}</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Total Leads</div>
                </div>
                <div className="mt-2 text-2xl font-bold">{manager.performance.leads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Conversion Rate</div>
                </div>
                <div className="mt-2 text-2xl font-bold">{manager.performance.conversionRate}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm font-medium">Telecallers</div>
                </div>
                <div className="mt-2 text-2xl font-bold">{manager.telecallers.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assigned Telecallers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {manager.telecallers.length === 0 ? (
                  <p className="text-sm text-gray-500">No telecallers assigned</p>
                ) : (
                  manager.telecallers.map((telecaller) => (
                    <div key={telecaller.id} className="py-2 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{telecaller.name}</p>
                        <p className="text-sm text-gray-500">{telecaller.employeeId}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        telecaller.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {telecaller.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {manager.tasks.length === 0 ? (
                  <p className="text-sm text-gray-500">No tasks assigned</p>
                ) : (
                  manager.tasks.map((task) => (
                    <div key={task.id} className="py-2">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{task.title}</p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          task.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}