// components/telecaller/upcoming-followups.tsx
"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Phone, Clock } from "lucide-react"
import { format, isPast } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface FollowUp {
  id: string
  leadId: string
  leadName: string
  leadPhone: string
  scheduledFor: Date
  notes: string
  status: "PENDING" | "COMPLETED" | "CANCELLED"
}

export function UpcomingFollowUps() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchFollowUps()
  }, [])

  const fetchFollowUps = async () => {
    try {
      const response = await fetch("/api/telecaller/followups?status=pending")
      const data = await response.json()
      setFollowUps(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch follow-ups",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCall = async (followUpId: string) => {
    try {
      // Implement call functionality
      toast({
        title: "Call Initiated",
        description: "Connecting to the lead...",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate call",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (scheduledFor: Date) => {
    if (isPast(scheduledFor)) {
      return <Badge variant="destructive">Overdue</Badge>
    }
    return <Badge variant="secondary">Upcoming</Badge>
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {followUps.map((followUp) => (
          <div
            key={followUp.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{followUp.leadName}</p>
                {getStatusBadge(new Date(followUp.scheduledFor))}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {format(new Date(followUp.scheduledFor), "PPp")}
              </div>
              {followUp.notes && (
                <p className="text-sm text-muted-foreground">{followUp.notes}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleCall(followUp.id)}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call Now
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {/* Implement reschedule */}}
              >
                <Clock className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            </div>
          </div>
        ))}
        {!isLoading && followUps.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No follow-ups scheduled
          </div>
        )}
      </div>
    </ScrollArea>
  )
}