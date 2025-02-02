"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import {
  BarChart as BarChartIcon,
  Download,
  Users,
  PhoneCall,
  TrendingUp
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  Label
} from "recharts"

interface ReportData {
  performanceData: any[]
  conversionData: any[]
  summaryStats: {
    totalLeads: number
    totalConversions: number
    avgConversionRate: number
    activeManagers: number
    activeTelecallers: number
  }
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | null
    to: Date | null
  }>({
    from: null,
    to: null
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchReportData = async () => {
    if (!dateRange.from || !dateRange.to) return

    try {
      setLoading(true)
      const response = await fetch(`/api/reports/head?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="grid gap-2">
              <Label>From Date</Label>
              <DatePicker
                date={dateRange.from}
                onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>To Date</Label>
              <DatePicker
                date={dateRange.to}
                onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
              />
            </div>
            <Button
              className="mt-8"
              onClick={fetchReportData}
              disabled={!dateRange.from || !dateRange.to || loading}
            >
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {reportData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summaryStats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                For selected period
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.summaryStats.avgConversionRate}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average conversion rate
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Team</CardTitle>
              <PhoneCall className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.summaryStats.activeManagers + reportData.summaryStats.activeTelecallers}
              </div>
              <p className="text-xs text-muted-foreground">
                {reportData.summaryStats.activeManagers} managers, {reportData.summaryStats.activeTelecallers} telecallers
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Reports */}
      {reportData && (
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
            <TabsTrigger value="conversion">Conversion Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="#4f46e5" name="Total Leads" />
                    <Bar dataKey="conversions" fill="#10b981" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conversion" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Conversion Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.conversionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#4f46e5" 
                      name="Conversion Rate"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}