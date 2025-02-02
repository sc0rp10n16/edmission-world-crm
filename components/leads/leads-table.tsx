// components/leads/leads-table.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  status: string
  assignedTo?: {
    name: string
  }
  preferredCountries: string[]
  createdAt: string
}

export function LeadsTable({ 
  selectedLeads, 
  onSelectLeads,
  refreshTrigger 
}: { 
  selectedLeads: string[]
  onSelectLeads: (ids: string[]) => void
  refreshTrigger: number
}) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchLeads()
  }, [refreshTrigger])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error('Error fetching leads:', error)
    }
  }

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(search.toLowerCase()) ||
    lead.phone.includes(search) ||
    lead.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedLeads.length === leads.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onSelectLeads(leads.map(l => l.id))
                    } else {
                      onSelectLeads([])
                    }
                  }}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedLeads.includes(lead.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        onSelectLeads([...selectedLeads, lead.id])
                      } else {
                        onSelectLeads(selectedLeads.filter(id => id !== lead.id))
                      }
                    }}
                  />
                </TableCell>
                <TableCell>{lead.name}</TableCell>
                <TableCell>
                  <div>{lead.phone}</div>
                  <div className="text-sm text-muted-foreground">{lead.email}</div>
                </TableCell>
                <TableCell>
                  {lead.preferredCountries.map(country => (
                    <Badge key={country} variant="secondary" className="mr-1">
                      {country}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  <Badge variant={lead.status === 'NEW' ? 'default' : 'secondary'}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell>{lead.assignedTo?.name || '-'}</TableCell>
                <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}