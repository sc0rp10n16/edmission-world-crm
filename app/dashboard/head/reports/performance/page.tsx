"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart as BarChartIcon,
  Download,
  Users,
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
  ResponsiveContainer
} from "recharts"

interface PerformanceData {
  id: string
  name: string
  role: string
  leads: number
  conversions: number
  conversionRate: number
  performance: {
    leads: number
    conversions: number
    conversionRate: number
  }
}

export default function PerformanceReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | null
    to: Date | null
  }>({
    from: null,
    to: null
  })
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [loading, setLoading] = useState(false)

  const fetchPerformanceData = async () => {
    if (!dateRange.from || !dateRange.to) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/reports/performance?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}&role=${roleFilter}`
      )
      const data = await response.json()
      setPerformanceData(data)
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Performance Reports</h1>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
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
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="MANAGER">Managers</SelectItem>
                  <SelectItem value="TELECALLER">Telecallers</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="mt-8"
              onClick={fetchPerformanceData}
              disabled={!dateRange.from || !dateRange.to || loading}
            >
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      {performanceData.length > 0 && (
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#4f46e5" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="leads" 
                    fill="#4f46e5" 
                    name="Total Leads" 
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="conversionRate" 
                    fill="#10b981" 
                    name="Conversion Rate (%)" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Total Leads</TableHead>
                    <TableHead className="text-right">Conversions</TableHead>
                    <TableHead className="text-right">Conversion Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.role}</TableCell>
                      <TableCell className="text-right">{item.leads}</TableCell>
                      <TableCell className="text-right">{item.conversions}</TableCell>
                      <TableCell className="text-right">
                        {item.conversionRate.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}