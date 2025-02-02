"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserPlus, Search, Calendar, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Manager, TaskStatus } from "@/types"
import { AssignTaskDialog } from "../tasks/assign-task-dialog"
import { Dispatch, SetStateAction } from "react"



interface TaskTabProps {
  managers: Manager[]
  selectedManager: Manager | null
  onManagerSelect: Dispatch<SetStateAction<Manager | null>>
  onRefresh: () => Promise<void>
}
export function TaskTab({
  managers,
  selectedManager,
  onManagerSelect,
  onRefresh
}: TaskTabProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task status')
      }

      toast.success('Task status updated successfully')
      await onRefresh()
    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error('Failed to update task status')
    }
  }

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manager Selection */}
          <div className="border rounded-lg p-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Select Manager</h3>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search managers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredManagers.map((manager) => (
                  <div
                    key={manager.id}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer transition-colors",
                      selectedManager?.id === manager.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-50 hover:bg-gray-100"
                    )}
                    onClick={() => onManagerSelect(manager)}
                  >
                    <div className="font-medium">{manager.name}</div>
                    <div className="text-sm opacity-90">
                      <span className="font-medium">{manager.tasks.length}</span>
                      {" "}active tasks
                    </div>
                    <div className="text-sm opacity-75">
                      {manager.employeeId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Task Management */}
          <div className="border rounded-lg p-4">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  {selectedManager 
                    ? `Tasks assigned to ${selectedManager.name}`
                    : "Task Management"}
                </h3>
                {selectedManager && (
                  <Button 
                    size="sm"
                    onClick={() => setShowAssignDialog(true)}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Assign Task
                  </Button>
                )}
              </div>

              {!selectedManager ? (
                <div className="flex items-center justify-center flex-1 text-muted-foreground">
                  Select a manager to manage tasks
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {selectedManager.tasks.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No tasks assigned yet
                    </div>
                  ) : (
                    selectedManager.tasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                             Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                            </div>
                          </div>
                          <select
                            className="text-sm border rounded px-2 py-1"
                            value={task.status}
                            onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                          >
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                        <div className={cn(
                          "text-xs px-2 py-1 rounded-full inline-block",
                          task.status === 'COMPLETED' && "bg-green-100 text-green-800",
                          task.status === 'IN_PROGRESS' && "bg-blue-100 text-blue-800",
                          task.status === 'PENDING' && "bg-yellow-100 text-yellow-800",
                          task.status === 'CANCELLED' && "bg-red-100 text-red-800"
                        )}>
                          {task.status}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>

      {/* Assign Task Dialog */}
      {selectedManager && (
        <AssignTaskDialog
          managerId={selectedManager.id}
          open={showAssignDialog}
          onClose={() => setShowAssignDialog(false)}
          onAssign={async () => {
            await onRefresh()
            setShowAssignDialog(false)
            toast.success('Task assigned successfully')
          }}
        />
      )}
    </Card>
  )
}