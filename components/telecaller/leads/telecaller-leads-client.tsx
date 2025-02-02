// components/telecaller/leads/telecaller-leads-client.tsx
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { columns } from "./columns"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { LeadColumn } from "./columns"
import {
  AlertCircle,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function TelecallerLeadsClient() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  const { data: leads = [], isLoading, isError } = useQuery<LeadColumn[]>({
    queryKey: ['telecaller-leads'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/telecallers/leads')
        if (!response.ok) {
          throw new Error('Failed to fetch leads')
        }
        return response.json()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch leads",
          variant: "destructive",
        })
        throw error
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  })

  // Filter leads based on status
  const filteredLeads = leads.filter(lead => {
    if (statusFilter === "all") return true
    return lead.status === statusFilter
  })

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load leads. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Leads Management</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search leads..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="INTERESTED">Interested</SelectItem>
              <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
              <SelectItem value="CONVERTED">Converted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>
            View and manage all your assigned leads. Click on a lead to see more details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={filteredLeads}
            isLoading={isLoading}
            searchValue={globalFilter}
            onSearchChange={setGlobalFilter}
          />
        </CardContent>
      </Card>
    </div>
  )
}