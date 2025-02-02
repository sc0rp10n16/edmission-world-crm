// components/telecaller/leads/my-leads-client.tsx
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

export function MyLeadsClient() {
  const [globalFilter, setGlobalFilter] = useState("")
  const { toast } = useToast()

  const { data: leads = [], isLoading } = useQuery<LeadColumn[]>({
    queryKey: ['leads'],
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
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
    staleTime: 1000 * 60 * 5, // Consider data stale after 5 minutes
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Leads</CardTitle>
        <CardDescription>
          View and manage all your assigned leads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <Input
            placeholder="Search leads..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-xs"
          />
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="INTERESTED">Interested</SelectItem>
              <SelectItem value="NOT_INTERESTED">Not Interested</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable 
          columns={columns} 
          data={leads} 
          isLoading={isLoading}
        />
      </CardContent>
    </Card>
  )
}