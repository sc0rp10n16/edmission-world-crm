// app/dashboard/manager/team/performance/page.tsx
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
import { TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TeamMember {
  id: string
  name: string
  callsMade: number
  leadsConverted: number
  conversionRate: number
  trend: 'up' | 'down'
  performance: number
}

export default function TeamPerformancePage() {
  const [performanceData, setPerformanceData] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/managers/team/performance')
      if (!response.ok) throw new Error('Failed to fetch performance data')
      const data = await response.json()
      setPerformanceData(data)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: "Failed to fetch performance data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading performance data...</div>
      </div>
    )
  }

  // Calculate team metrics
  const teamMetrics = {
    totalCalls: performanceData.reduce((sum, member) => sum + member.callsMade, 0),
    totalConversions: performanceData.reduce((sum, member) => sum + member.leadsConverted, 0),
    averageConversion: performanceData.length > 0 
      ? (performanceData.reduce((sum, member) => sum + member.conversionRate, 0) / performanceData.length).toFixed(1)
      : 0
  }

  return (
    <div className="space-y-6 p-8">
      <h2 className="text-3xl font-bold tracking-tight">Team Performance</h2>

      {/* Team Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls Made</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.totalCalls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.totalConversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMetrics.averageConversion}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Member Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Calls Made</TableHead>
                <TableHead className="text-right">Leads Converted</TableHead>
                <TableHead className="text-right">Conversion Rate</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell className="text-right">{member.callsMade}</TableCell>
                  <TableCell className="text-right">{member.leadsConverted}</TableCell>
                  <TableCell className="text-right">{member.conversionRate}%</TableCell>
                  <TableCell>
                    {member.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${Math.min(member.performance, 100)}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}