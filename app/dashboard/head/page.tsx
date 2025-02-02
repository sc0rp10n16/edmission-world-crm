"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  PhoneCall, 
  FileText, 
  ClipboardCheck,
  TrendingUp,
  Plane,
  Calendar,
  ArrowUpIcon, 
  ArrowDownIcon 
} from "lucide-react"
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts'

interface DashboardMetrics {
  totalManagers: number
  activeTelecallers: number
  totalApplications: number
  pendingTasks: number
  managerGrowth: number
  telecallerGrowth: number
  applicationGrowth: number
  recentLeads: number
  currentMonthTarget: number
  currentMonthAchieved: number
  averageConversionRate: number
  visaMetrics: {
    approved: number
    rejected: number
    processing: number
    successRate: number
  }
}

// Visa Statistics Component
const VisaStatistics = ({ metrics }: { metrics: DashboardMetrics }) => {
  const visaData = [
    { 
      name: 'Approved', 
      value: metrics.visaMetrics.approved,
      color: '#10B981' // green
    },
    { 
      name: 'Processing', 
      value: metrics.visaMetrics.processing,
      color: '#F59E0B' // yellow
    },
    { 
      name: 'Rejected', 
      value: metrics.visaMetrics.rejected,
      color: '#EF4444' // red
    }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Visa Status Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Visa Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={visaData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    value,
                    index
                  }) => {
                    const RADIAN = Math.PI / 180
                    const radius = 25 + innerRadius + (outerRadius - innerRadius)
                    const x = cx + radius * Math.cos(-midAngle * RADIAN)
                    const y = cy + radius * Math.sin(-midAngle * RADIAN)

                    return (
                      <text
                        x={x}
                        y={y}
                        fill={visaData[index].color}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                      >
                        {value}
                      </text>
                    )
                  }}
                >
                  {visaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value} applications`, '']}
                  contentStyle={{ 
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Visa Statistics Cards */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-green-600">
                {metrics.visaMetrics.successRate.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                of total applications
              </div>
            </div>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${metrics.visaMetrics.successRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-yellow-500">
                  {metrics.visaMetrics.processing}
                </div>
                <Plane className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-xs text-gray-500">
                Applications currently in process
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Processed</div>
                <div className="text-2xl font-bold">
                  {metrics.visaMetrics.approved + metrics.visaMetrics.rejected}
                </div>
              </div>
              <div className={`text-sm ${
                metrics.applicationGrowth >= 0 ? 'text-green-500' : 'text-red-500'
              } flex items-center`}>
                {metrics.applicationGrowth >= 0 ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(metrics.applicationGrowth)}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main Dashboard Component
export default function HeadDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard/head')
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error('Error fetching metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    // Refresh every 5 minutes
    const interval = setInterval(fetchMetrics, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !metrics) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button>
            Download Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Managers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalManagers}</div>
            <p className="text-xs text-muted-foreground">
              <span className={metrics.managerGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {metrics.managerGrowth >= 0 ? <ArrowUpIcon className="inline h-4 w-4" /> : <ArrowDownIcon className="inline h-4 w-4" />}
                {Math.abs(metrics.managerGrowth)}%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Telecallers</CardTitle>
            <PhoneCall className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTelecallers}</div>
            <p className="text-xs text-muted-foreground">
              <span className={metrics.telecallerGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {metrics.telecallerGrowth >= 0 ? <ArrowUpIcon className="inline h-4 w-4" /> : <ArrowDownIcon className="inline h-4 w-4" />}
                {Math.abs(metrics.telecallerGrowth)}%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalApplications}</div>
            <p className="text-xs text-muted-foreground">
              <span className={metrics.applicationGrowth >= 0 ? "text-green-500" : "text-red-500"}>
                {metrics.applicationGrowth >= 0 ? <ArrowUpIcon className="inline h-4 w-4" /> : <ArrowDownIcon className="inline h-4 w-4" />}
                {Math.abs(metrics.applicationGrowth)}%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visa Statistics */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Visa Applications</h3>
        <VisaStatistics metrics={metrics} />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Target</div>
                  <div className="text-2xl font-bold">{metrics.currentMonthTarget}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Achieved</div>
                  <div className="text-2xl font-bold">{metrics.currentMonthAchieved}</div>
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  <div className="text-2xl font-bold">{metrics.averageConversionRate.toFixed(1)}%</div>
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(metrics.currentMonthAchieved / metrics.currentMonthTarget * 100).toFixed(1)}%` 
                  }} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.recentLeads}</div>
            <p className="text-sm text-muted-foreground">New leads in last 7 days</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}