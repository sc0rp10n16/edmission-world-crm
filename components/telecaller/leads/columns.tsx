// components/telecaller/leads/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Phone, Calendar, Mail, PhoneCall } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LeadStatus } from "@prisma/client"
import { CallDialog } from "./call-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type LeadColumn = {
  id: string
  name: string
  phone: string
  email: string | null
  status: LeadStatus
  lastContactedAt: Date | null
  nextFollowUpDate: Date | null
  totalCallAttempts: number
  preferredCourses: string[]
  preferredCountries: string[]
  notes: string | null
}

export const columns: ColumnDef<LeadColumn>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const notes = row.original.notes
      const preferredCourses = row.original.preferredCourses
      
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="font-medium">
                {row.original.name}
                {preferredCourses.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Interested in: {preferredCourses.join(", ")}
                  </div>
                )}
              </div>
            </TooltipTrigger>
            {notes && <TooltipContent>{notes}</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      )
    },
  },
  {
    accessorKey: "phone",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Contact Info
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {row.original.phone}
          </div>
          {row.original.email && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Mail className="h-4 w-4" />
              {row.original.email}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.getValue("status") as LeadStatus
      const attempts = row.original.totalCallAttempts
      
      return (
        <div className="space-y-1">
          <Badge variant={getStatusVariant(status)}>
            {status.replace("_", " ")}
          </Badge>
          <div className="text-xs text-muted-foreground">
            {attempts} call{attempts !== 1 ? 's' : ''} made
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "lastContactedAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Last Contacted
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("lastContactedAt") as Date | null
      return (
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-muted-foreground" />
          {date ? new Date(date).toLocaleDateString() : "Never"}
        </div>
      )
    },
  },
  {
    accessorKey: "nextFollowUpDate",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Next Follow-up
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("nextFollowUpDate") as Date | null
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {date ? new Date(date).toLocaleDateString() : "-"}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const lead = row.original

      return (
        <div className="flex items-center gap-2">
          <CallDialog lead={lead} />
          
        </div>
      )
    },
  },
]

function getStatusVariant(status: LeadStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "NEW":
      return "default"
    case "CONTACTED":
      return "secondary"
    case "INTERESTED":
      return "outline"
    case "NOT_INTERESTED":
      return "destructive"
    case "CONVERTED":
      return "outline"
    case "LOST":
      return "destructive"
    default:
      return "default"
  }
}