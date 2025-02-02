// components/telecaller/telecaller-leads-table.tsx
"use client"

import { useState } from "react"
import { Table } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { PhoneCall, Calendar, FileText, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface TelecallerLead {
  id: string
  name: string
  phone: string
  email: string
  status: 'new' | 'contacted' | 'interested' | 'not-interested' | 'follow-up' | 'converted'
  lastContact: Date | null
  nextFollowUp: Date | null
  notes: string
  course: string
  preferredCountry: string
}

const statusColors = {
  'new': 'bg-blue-100 text-blue-800',
  'contacted': 'bg-gray-100 text-gray-800',
  'interested': 'bg-green-100 text-green-800',
  'not-interested': 'bg-red-100 text-red-800',
  'follow-up': 'bg-yellow-100 text-yellow-800',
  'converted': 'bg-purple-100 text-purple-800'
}

export function TelecallerLeadsTable() {
  const [leads, setLeads] = useState<TelecallerLead[]>([])
  const [selectedLead, setSelectedLead] = useState<TelecallerLead | null>(null)
  const [isCallLogOpen, setIsCallLogOpen] = useState(false)
  const { toast } = useToast()

  const handleCall = async (leadId: string) => {
    try {
      // API call to log call initiation
      toast({
        title: "Call Initiated",
        description: "Connecting to the lead...",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not initiate call",
        variant: "destructive",
      })
    }
  }

  const handleStatusUpdate = async (leadId: string, newStatus: TelecallerLead['status']) => {
    try {
      // API call to update lead status
      toast({
        title: "Status Updated",
        description: `Lead status changed to ${newStatus}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update lead status",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Course</th>
            <th>Status</th>
            <th>Last Contact</th>
            <th>Next Follow-up</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <div>
                  <p className="font-medium">{lead.name}</p>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                </div>
              </td>
              <td>{lead.phone}</td>
              <td>{lead.course}</td>
              <td>
                <Badge variant="outline" className={statusColors[lead.status]}>
                  {lead.status.replace('-', ' ')}
                </Badge>
              </td>
              <td>
                {lead.lastContact ? (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {lead.lastContact.toLocaleDateString()}
                  </div>
                ) : '-'}
              </td>
              <td>
                {lead.nextFollowUp ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {lead.nextFollowUp.toLocaleDateString()}
                  </div>
                ) : '-'}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleCall(lead.id)}
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline">
                        Actions
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Add Notes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsCallLogOpen(true)}>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Follow-up
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Call Log Dialog */}
      <Dialog open={isCallLogOpen} onOpenChange={setIsCallLogOpen}>
        {/* Add call log form component here */}
      </Dialog>

      {/* Notes Dialog */}
      <Dialog 
        open={!!selectedLead} 
        onOpenChange={() => setSelectedLead(null)}
      >
        {/* Add notes form component here */}
      </Dialog>
    </div>
  )
}