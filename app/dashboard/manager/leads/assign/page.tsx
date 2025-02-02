// app/dashboard/manager/leads/assign/page.tsx
'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"


interface Lead {
  id: string
  name: string
  contact: string
  source: string
  status: string
  assignedTo: string | null
}

interface Telecaller {
  id: string
  name: string
  activeLeads: number
}

export default function AssignLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [telecallers, setTelecallers] = useState<Telecaller[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [leadsResponse, telecallersResponse] = await Promise.all([
        fetch('/api/manager/leads/unassigned'),
        fetch('/api/manager/telecallers')
      ])
      
      const leadsData = await leadsResponse.json()
      const telecallersData = await telecallersResponse.json()
      
      setLeads(leadsData)
      setTelecallers(telecallersData)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (telecallerId: string) => {
    try {
      const response = await fetch('/api/manager/leads/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: selectedLeads,
          telecallerId
        })
      })

      if (!response.ok) throw new Error('Failed to assign leads')

      toast({
        title: "Success",
        description: "Leads assigned successfully",
      })

      // Refresh data
      fetchData()
      setSelectedLeads([])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign leads",
        variant: "destructive"
      })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Assign Leads</h2>
        
        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {selectedLeads.length} leads selected
            </span>
            <Select onValueChange={handleAssign}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Assign to telecaller" />
              </SelectTrigger>
              <SelectContent>
                {telecallers.map((telecaller) => (
                  <SelectItem key={telecaller.id} value={telecaller.id}>
                    {telecaller.name} ({telecaller.activeLeads} active)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Unassigned Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedLeads.length === leads.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedLeads(leads.map(lead => lead.id))
                      } else {
                        setSelectedLeads([])
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLeads([...selectedLeads, lead.id])
                        } else {
                          setSelectedLeads(selectedLeads.filter(id => id !== lead.id))
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.contact}</TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>{lead.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}