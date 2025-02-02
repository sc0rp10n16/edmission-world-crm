"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Manager } from "@/types"

interface TelecallerTabProps {
  managers: Manager[]
  selectedManager: Manager | null
  onManagerSelect: (manager: Manager) => void
  onRefresh: () => Promise<void>
}

export function TelecallerTab({
  managers,
  selectedManager,
  onManagerSelect,
  onRefresh
}: TelecallerTabProps) {
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

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

      if (!response.ok) {
        throw new Error('Failed to remove telecaller')
      }

      toast.success('Telecaller removed successfully')
      await onRefresh()
    } catch (error) {
      console.error('Error removing telecaller:', error)
      toast.error('Failed to remove telecaller')
    }
  }

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  )
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telecaller Assignment</CardTitle>
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
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedManager?.id === manager.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => onManagerSelect(manager)}
                  >
                    <div className="font-medium">{manager.name}</div>
                    <div className="text-sm opacity-90">
                      <span className="font-medium">{manager.telecallers.length}</span>
                      {" "}telecallers assigned
                    </div>
                    <div className="text-sm opacity-75">
                      {manager.employeeId}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Telecaller Assignment */}
          <div className="border rounded-lg p-4">
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">
                  {selectedManager 
                    ? `Telecallers assigned to ${selectedManager.name}`
                    : "Telecaller Assignment"}
                </h3>
                {selectedManager && (
                  <Button 
                    size="sm"
                    onClick={() => setShowAssignDialog(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Telecaller
                  </Button>
                )}
              </div>

              {!selectedManager ? (
                <div className="flex items-center justify-center flex-1 text-muted-foreground">
                  Select a manager to manage telecaller assignments
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {selectedManager.telecallers.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      No telecallers assigned yet
                    </div>
                  ) : (
                    selectedManager.telecallers.map((telecaller) => (
                      <div
                        key={telecaller.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div>
                          <div className="font-medium">{telecaller.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {telecaller.employeeId}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Status: {" "}
                            <span className={`${
                              telecaller.status === 'ACTIVE' 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {telecaller.status}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </div>
      </CardContent>

      {/* Assign Telecaller Dialog */}
      {selectedManager && (
        <Dialog 
          open={showAssignDialog} 
          onOpenChange={setShowAssignDialog}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                Assign Telecaller to {selectedManager.name}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <AssignTelecallerContent
                managerId={selectedManager.id}
                onAssign={async () => {
                  await onRefresh()
                  setShowAssignDialog(false)
                  toast.success('Telecaller assigned successfully')
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}