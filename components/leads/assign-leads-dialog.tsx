"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { toast } from "sonner"

interface Telecaller {
  id: string
  name: string
  employeeId: string
  email: string
  status: string
  performance: {
    leads: number
    conversions: number
    conversionRate: number
  } | null
}

export function AssignLeadsDialog({
  open,
  onClose,
  leadIds,
  onAssign
}: {
  open: boolean
  onClose: () => void
  leadIds: string[]
  onAssign: () => void
}) {
  const [telecallers, setTelecallers] = useState<Telecaller[]>([])
  const [selectedTelecaller, setSelectedTelecaller] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (open) {
      fetchTelecallers()
    }
  }, [open])

  const fetchTelecallers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/telecallers')
      
      if (!response.ok) {
        console.error('Response status:', response.status)
        const text = await response.text()
        console.error('Response text:', text)
        throw new Error('Failed to fetch telecallers')
      }

      const data = await response.json()
      console.log('Fetched telecallers:', data)
      setTelecallers(data)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load telecallers')
    } finally {
      setLoading(false)
    }
  }

  const filteredTelecallers = telecallers.filter(telecaller => 
    telecaller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    telecaller.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    telecaller.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleAssign = async () => {
    if (!selectedTelecaller) return

    try {
      setLoading(true)
      const response = await fetch('/api/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds,
          telecallerId: selectedTelecaller
        })
      })

      if (!response.ok) throw new Error('Failed to assign leads')

      toast.success('Leads assigned successfully')
      onAssign()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to assign leads')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Leads to Telecaller</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search telecallers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Loading telecallers...
              </div>
            ) : filteredTelecallers.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No telecallers found
              </div>
            ) : (
              filteredTelecallers.map((telecaller) => (
                <div
                  key={telecaller.id}
                  onClick={() => setSelectedTelecaller(telecaller.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedTelecaller === telecaller.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-medium">{telecaller.name}</div>
                      <div className="text-sm opacity-90">{telecaller.employeeId}</div>
                      <div className="text-sm opacity-75">{telecaller.email}</div>
                    </div>
                    {telecaller.performance && (
                      <div className="text-right text-sm">
                        <div>Leads: {telecaller.performance.leads}</div>
                        <div>Conv: {telecaller.performance.conversionRate}%</div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              disabled={!selectedTelecaller || loading}
              onClick={handleAssign}
            >
              {loading ? "Assigning..." : `Assign ${leadIds.length} Leads`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}