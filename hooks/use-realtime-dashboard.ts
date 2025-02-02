// hooks/use-realtime-dashboard.ts
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { LeadStatus, CallStatus } from "@prisma/client"

interface DashboardStats {
  totalLeads: number
  todaysCalls: number
  pendingFollowUps: number
  conversionRate: number
  leadsByStatus: {
    status: string
    _count: { status: number }
  }[]
  recentCalls: {
    id: string
    leadName: string
    status: CallStatus
    outcome: string
    createdAt: string
  }[]
}

export function useRealtimeDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/telecallers/dashboard/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchDashboardData()

    // Set up polling every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)

    return () => clearInterval(interval)
  }, [])

  return { stats, isLoading }
}