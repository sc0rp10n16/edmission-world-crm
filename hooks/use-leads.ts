// hooks/use-leads.ts
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { LeadColumn } from "@/components/telecaller/leads/columns"

export function useLeads() {
  const [leads, setLeads] = useState<LeadColumn[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch("/api/telecallers/leads")
      if (!response.ok) {
        throw new Error("Failed to fetch leads")
      }
      const data = await response.json()
      setLeads(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch leads",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return { leads, isLoading, refetch: fetchLeads }
}