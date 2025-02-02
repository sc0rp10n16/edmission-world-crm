"use client"

import { useState, useEffect } from "react"
import { Performance, Telecaller, Task } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { 
  UserPlus, 
  Search, 
  MoreVertical,
  Filter,
  Download,
  ClipboardList,
  BarChart3,
  ViewIcon,
  Edit,
  Trash,
  Power
} from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewManagerDetails } from "@/components/managers/view-manager-details"
import { EditManagerForm } from "@/components/managers/edit-manager-form"
import { AddManagerForm } from "@/components/forms/add-manager-form"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { AssignTelecallerForm } from "@/components/forms/assign-telecaller-form"
import { AssignTelecallerDialog } from "@/components/telecaller/assign-telecaller-dialog"
import { TaskTab } from "@/components/managers/task-tab"

interface Manager {
  id: string
  employeeId: string
  name: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  performance: {
    leads: number
    conversions: number
    conversionRate: number
  }
  telecallers: Array<{
    id: string
    name: string
    employeeId: string
    status: 'ACTIVE' | 'INACTIVE'
  }>
  tasks: Array<{
    id: string
    title: string
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    dueDate: string
  }>
}

export default function ManageManagersPage() {
  // State Management
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [managers, setManagers] = useState<Manager[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null)
  
  // Dialog States
  const [selectedManagerForView, setSelectedManagerForView] = useState<Manager | null>(null)
  const [selectedManagerForEdit, setSelectedManagerForEdit] = useState<Manager | null>(null)
  const [selectedManagerForDelete, setSelectedManagerForDelete] = useState<Manager | null>(null)
  const [isAddManagerOpen, setIsAddManagerOpen] = useState(false)

  // Fetch Managers
  useEffect(() => {
    fetchManagers()
  }, [])

  const fetchManagers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/managers')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch managers')
      }

      const data = await response.json()
      setManagers(data)
    } catch (error) {
      console.error('Error fetching managers:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      toast.error("Failed to fetch managers")
    } finally {
      setLoading(false)
    }
  }

  // Handle Status Change
  const handleStatusChange = async (managerId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
  try {
    setLoading(true)
    const response = await fetch(`/api/managers/${managerId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update status')
    }

    toast.success(`Manager ${newStatus.toLowerCase()}d successfully`)
    await fetchManagers()
  } catch (error) {
    console.error('Error updating status:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to update status')
  } finally {
    setLoading(false)
  }
}

  // Handle Manager Deletion
  const handleDeleteManager = async (managerId: string) => {
  try {
    setLoading(true)
    const response = await fetch(`/api/managers/${managerId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete manager')
    }

    toast.success('Manager removed successfully')
    await fetchManagers()
  } catch (error) {
    console.error('Error deleting manager:', error)
    toast.error(error instanceof Error ? error.message : 'Failed to remove manager')
  } finally {
    setLoading(false)
    setSelectedManagerForDelete(null)
  }
}

  // Filter managers based on search query
  const filteredManagers = managers.filter(manager => 
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const handleRemoveTelecaller = async (telecallerId: string) => {
  try {
    if (!selectedManager) return

    const response = await fetch(`/api/managers/${selectedManager.id}/telecallers`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ telecallerId }),
    })

    if (!response.ok) throw new Error('Failed to remove telecaller')

    toast.success("Telecaller removed successfully")
    await fetchManagers()
  } catch (error) {
    console.error('Error removing telecaller:', error)
    toast.error("Failed to remove telecaller")
  }
}
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Managers</h1>
        <Dialog open={isAddManagerOpen} onOpenChange={setIsAddManagerOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Manager
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Manager</DialogTitle>
            </DialogHeader>
            <AddManagerForm onSuccess={() => {
              fetchManagers()
              setIsAddManagerOpen(false)
            }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            className="absolute top-0 right-0 p-3"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search managers..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="managers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="managers">Managers List</TabsTrigger>
          <TabsTrigger value="telecallers">Telecaller Assignment</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
        </TabsList>

        {/* Managers List Tab */}
        <TabsContent value="managers">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Telecallers</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredManagers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No managers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredManagers.map((manager) => (
                      <TableRow key={manager.id}>
                        <TableCell>{manager.employeeId}</TableCell>
                        <TableCell>{manager.name}</TableCell>
                        <TableCell>{manager.email}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            manager.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {manager.status}
                          </span>
                        </TableCell>
                        <TableCell>{manager.telecallers.length}</TableCell>
                        <TableCell>{manager.performance.conversionRate}%</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedManagerForView(manager)}>
                                <ViewIcon className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setSelectedManagerForEdit(manager)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(
                                  manager.id, 
                                  manager.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                                )}
                              >
                                <Power className="mr-2 h-4 w-4" />
                                {manager.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setSelectedManagerForDelete(manager)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Remove
                                <ConfirmDialog
                                  open={!!selectedManagerForDelete}
                                  onOpenChange={() => setSelectedManagerForDelete(null)}
                                  title="Remove Manager"
                                  description={`Are you sure you want to remove ${selectedManagerForDelete?.name}? This action cannot be undone and will remove all associated data.`}
                                  confirmText="Remove"
                                  cancelText="Cancel"
                                  onConfirm={() => {
                                    if (selectedManagerForDelete) {
                                      handleDeleteManager(selectedManagerForDelete.id)
                                    }
                                  }}
                                />
                              </DropdownMenuItem>

                              <DropdownMenuSeparator />
                              
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tabs Content */}
        {/* Telecaller assignment */}
        <TabsContent value="telecallers">
  <Card>
    <CardHeader>
      <CardTitle>Telecaller Assignment</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manager Selection */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-4">Select Manager</h3>
          <div className="space-y-2">
            {managers.map((manager) => (
              <div
                key={manager.id}
                className={cn(
                  "p-4 rounded-lg cursor-pointer transition-colors",
                  selectedManager?.id === manager.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-50 hover:bg-gray-100"
                )}
                onClick={() => setSelectedManager(manager)}
              >
                <div className="font-medium">{manager.name}</div>
                <div className="text-sm opacity-90">
                  {manager.telecallers.length} telecallers assigned
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Telecaller Assignment */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">
              {selectedManager 
                ? `Telecallers assigned to ${selectedManager.name}`
                : "Telecaller Assignment"}
            </h3>
            {selectedManager && (
              <Button size="sm" onClick={() => setShowAssignDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Telecaller
              </Button>
            )}
          </div>

          {!selectedManager ? (
            <div className="text-center text-muted-foreground py-8">
              Select a manager to manage telecaller assignments
            </div>
          ) : (
            <div className="space-y-2">
              {selectedManager.telecallers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No telecallers assigned yet
                </div>
              ) : (
                selectedManager.telecallers.map((telecaller) => (
                  <div
                    key={telecaller.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{telecaller.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {telecaller.employeeId}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveTelecaller(telecaller.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>

  {/* Add the assign dialog */}
  {selectedManager && (
    <AssignTelecallerDialog
      managerId={selectedManager.id}
      open={showAssignDialog}
      onClose={() => setShowAssignDialog(false)}
      onAssign={() => {
        fetchManagers()
        toast.success('Telecaller assigned successfully')
      }}
    />
  )}
</TabsContent>

        <TabsContent value="tasks">
          <TaskTab
            managers={managers}
            selectedManager={selectedManager}
            onManagerSelect={setSelectedManager}
            onRefresh={fetchManagers}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedManagerForView && (
        <ViewManagerDetails
          manager={selectedManagerForView}
          open={!!selectedManagerForView}
          onClose={() => setSelectedManagerForView(null)}
        />
      )}

      {selectedManagerForEdit && (
        <EditManagerForm
          manager={selectedManagerForEdit}
          open={!!selectedManagerForEdit}
          onClose={() => setSelectedManagerForEdit(null)}
          onSuccess={() => {
            fetchManagers()
            setSelectedManagerForEdit(null)
          }}
        />
      )}

      <ConfirmDialog
        open={!!selectedManagerForDelete}
        onOpenChange={() => setSelectedManagerForDelete(null)}
        title="Remove Manager"
        description="Are you sure you want to remove this manager? This action cannot be undone."
        confirmText="Remove"
        cancelText="Cancel"
        onConfirm={() => {
          if (selectedManagerForDelete) {
            handleDeleteManager(selectedManagerForDelete.id)
          }
        }}
      />
    </div>
  )
}