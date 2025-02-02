"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts"
import { Download, TrendingUp } from "lucide-react"

interface ConversionData {
  date: string
  total: number
  converted: number
  rate: number
}

export default function ConversionReportsPage() {
  const [dateRange, setDateRange] = useState<{
    from: Date | null
    to: Date | null
  }>({
    from: null,
    to: null
  })
  const [conversionData, setConversionData] = useState<ConversionData[]>([])
  const [loading, setLoading] = useState(false)

  const fetchConversionData = async () => {
    if (!dateRange.from || !dateRange.to) return

    try {
      setLoading(true)
      const response = await fetch(
        `/api/reports/conversions?from=${dateRange.from.toISOString()}&to=${dateRange.to.toISOString()}`
      )
      const data = await response.json()
      setConversionData(data)
    } catch (error) {
      console.error('Error fetching conversion data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate summary statistics
  const summaryStats = conversionData.reduce((acc, curr) => ({
    totalLeads: acc.totalLeads + curr.total,
    totalConverted: acc.totalConverted + curr.converted,
    avgRate: acc.avgRate + curr.rate
  }), { totalLeads: 0, totalConverted: 0, avgRate: 0 })

  if (conversionData.length > 0) {
    summaryStats.avgRate = summaryStats.avgRate / conversionData.length
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Conversion Reports</h1>
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
              onClick={fetchConversionData}
              disabled={!dateRange.from || !dateRange.to || loading}
            >
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {conversionData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summaryStats.totalConverted}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summaryStats.avgRate.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversion Trend Chart */}
      {conversionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Conversion Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#4f46e5" 
                  name="Conversion Rate (%)" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Data Table */}
      {conversionData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Conversion Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total Leads</TableHead>
                  <TableHead className="text-right">Conversions</TableHead>
                  <TableHead className="text-right">Conversion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conversionData.map((item) => (
                  <TableRow key={item.date}>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right">{item.total}</TableCell>
                    <TableCell className="text-right">{item.converted}</TableCell>
                    <TableCell className="text-right">
                      {item.rate.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}