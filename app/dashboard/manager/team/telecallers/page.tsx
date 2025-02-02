// app/dashboard/manager/team/telecallers/page.tsx
'use client'

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Types
interface Telecaller {
  id: string
  name: string
  email: string
  employeeId: string
  status: 'ACTIVE' | 'INACTIVE'
  performance: {
    leads: number
    conversions: number
    conversionRate: number
    callsMade: number
    monthlyTarget: number
  } | null
}

interface TelecallerDetails extends Telecaller {
  recentLeads: {
    id: string
    name: string
    status: string
    createdAt: string
  }[]
  recentCalls: {
    id: string
    duration: number
    outcome: string
    createdAt: string
  }[]
}

export default function TelecallersPage() {
  const [telecallers, setTelecallers] = useState<Telecaller[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTelecaller, setSelectedTelecaller] = useState<TelecallerDetails | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchTelecallers()
  }, [])

  const fetchTelecallers = async () => {
    try {
      const response = await fetch('/api/managers/telecallers')
      if (!response.ok) throw new Error('Failed to fetch telecallers')
      const data = await response.json()
      setTelecallers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch telecallers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchTelecallerDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/managers/telecallers/${id}/details`)
      if (!response.ok) throw new Error('Failed to fetch details')
      const data = await response.json()
      setSelectedTelecaller(data)
      setShowDetailsDialog(true)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch telecaller details",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Telecallers</h2>
      </div>

      {/* Main Telecallers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {telecallers.map((telecaller) => (
                <TableRow key={telecaller.id}>
                  <TableCell className="font-medium">{telecaller.name}</TableCell>
                  <TableCell>{telecaller.employeeId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {telecaller.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={telecaller.status === 'ACTIVE' ? 'default' : 'secondary'}>
                      {telecaller.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div>Leads: {telecaller.performance?.leads ?? 0}</div>
                      <div>Conversion: {telecaller.performance?.conversionRate ?? 0}%</div>
                      <div>Calls: {telecaller.performance?.callsMade ?? 0}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline"
                      onClick={() => fetchTelecallerDetails(telecaller.id)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Telecaller Details</DialogTitle>
          </DialogHeader>
          
          {selectedTelecaller && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="leads">Recent Leads</TabsTrigger>
                <TabsTrigger value="calls">Recent Calls</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Name</p>
                        <p>{selectedTelecaller.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Employee ID</p>
                        <p>{selectedTelecaller.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p>{selectedTelecaller.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Status</p>
                        <Badge variant={selectedTelecaller.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {selectedTelecaller.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                        <p className="text-2xl font-bold">{selectedTelecaller.performance?.leads ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-2xl font-bold">{selectedTelecaller.performance?.conversionRate ?? 0}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Calls Made</p>
                        <p className="text-2xl font-bold">{selectedTelecaller.performance?.callsMade ?? 0}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Target</p>
                        <p className="text-2xl font-bold">{selectedTelecaller.performance?.monthlyTarget ?? 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leads">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTelecaller.recentLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell>{lead.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{lead.status}</Badge>
                            </TableCell>
                            <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="calls">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Calls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Outcome</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedTelecaller.recentCalls.map((call) => (
                          <TableRow key={call.id}>
                            <TableCell>{new Date(call.createdAt).toLocaleString()}</TableCell>
                            <TableCell>{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</TableCell>
                            <TableCell>{call.outcome}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}