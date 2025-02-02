// app/dashboard/manager/team/page.tsx
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
import { PhoneCall, Users, TrendingUp, Target, BarChart } from "lucide-react"

interface Telecaller {
  id: string
  name: string
  email: string
  phone: string
  status: 'ACTIVE' | 'INACTIVE'
  performance: {
    leads: number
    conversions: number
    conversionRate: number
    callsMade: number
    monthlyTarget: number
  }
}

interface TeamMetrics {
  totalTelecallers: number
  activeTelecallers: number
  totalLeads: number
  averageConversion: number
  targetAchievement: number
}

const defaultMetrics: TeamMetrics = {
  totalTelecallers: 0,
  activeTelecallers: 0,
  totalLeads: 0,
  averageConversion: 0,
  targetAchievement: 0
}

export default function TeamPage() {
  const [telecallers, setTelecallers] = useState<Telecaller[]>([])
  const [metrics, setMetrics] = useState<TeamMetrics>(defaultMetrics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/managers/team')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch team data: ${response.statusText}`)
      }

      const data = await response.json()
      setTelecallers(data.telecallers || [])
      setMetrics(data.metrics || defaultMetrics)
    } catch (error) {
      console.error('Error:', error)
      setError(error instanceof Error ? error.message : 'Failed to load team data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchTeamData}
            className="px-4 py-2 bg-primary text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <h2 className="text-3xl font-bold tracking-tight">Team Overview</h2>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Telecallers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTelecallers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeTelecallers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">Assigned leads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageConversion}%</div>
            <p className="text-xs text-muted-foreground">Team conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.targetAchievement}%</div>
            <p className="text-xs text-muted-foreground">Monthly progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Calls</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {telecallers.filter(t => t.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">Online telecallers</p>
          </CardContent>
        </Card>
      </div>

      {/* Telecallers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {telecallers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leads</TableHead>
                  <TableHead>Conversion Rate</TableHead>
                  <TableHead>Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {telecallers.map((telecaller) => (
                  <TableRow key={telecaller.id}>
                    <TableCell className="font-medium">{telecaller.name}</TableCell>
                    <TableCell>
                      <div>{telecaller.email}</div>
                      <div className="text-sm text-muted-foreground">{telecaller.phone}</div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        telecaller.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {telecaller.status}
                      </span>
                    </TableCell>
                    <TableCell>{telecaller.performance.leads}</TableCell>
                    <TableCell>{telecaller.performance.conversionRate}%</TableCell>
                    <TableCell>
                      <div className="w-full bg-secondary rounded-full h-2.5">
                        <div
                          className="bg-primary h-2.5 rounded-full"
                          style={{
                            width: `${Math.min((telecaller.performance.conversions / (telecaller.performance.monthlyTarget || 1)) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No telecallers found. Add team members to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}