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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search } from "lucide-react"

interface Performance {
  leads: number
  conversions: number
  conversionRate: number
}

interface Telecaller {
  id: string
  name: string
  employeeId: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  performance: Performance | null // Make performance optional
}

interface AssignTelecallerDialogProps {
  managerId: string
  open: boolean
  onClose: () => void
  onAssign: () => void
}

export function AssignTelecallerDialog({
  managerId,
  open,
  onClose,
  onAssign
}: AssignTelecallerDialogProps) {
  const [telecallers, setTelecallers] = useState<Telecaller[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (open) {
      fetchAvailableTelecallers()
    }
  }, [open])

  const fetchAvailableTelecallers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/telecallers/available')
      if (!response.ok) {
        throw new Error('Failed to fetch telecallers')
      }
      const data = await response.json()
      setTelecallers(data)
    } catch (error) {
      console.error('Error fetching telecallers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (telecallerId: string) => {
    try {
      const response = await fetch(`/api/managers/${managerId}/telecallers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telecallerId }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign telecaller')
      }

      onAssign()
      onClose()
    } catch (error) {
      console.error('Error assigning telecaller:', error)
    }
  }

  const filteredTelecallers = telecallers.filter(telecaller =>
    telecaller.name.toLowerCase().includes(search.toLowerCase()) ||
    telecaller.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    telecaller.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assign Telecaller</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search telecallers..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading available telecallers...
                    </TableCell>
                  </TableRow>
                ) : filteredTelecallers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No available telecallers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTelecallers.map((telecaller) => (
                    <TableRow key={telecaller.id}>
                      <TableCell>{telecaller.employeeId}</TableCell>
                      <TableCell>{telecaller.name}</TableCell>
                      <TableCell>{telecaller.email}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          telecaller.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {telecaller.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>Leads: {telecaller.performance?.leads ?? 0}</div>
                          <div>Conversion: {telecaller.performance?.conversionRate ?? 0}%</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(telecaller.id)}
                        >
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}