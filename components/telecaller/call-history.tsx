// components/telecaller/call-history.tsx
"use client"

import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Phone, PhoneOff, PhoneMissed, Clock } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CallStatus } from "@prisma/client"

interface CallRecord {
  id: string
  leadId: string
  leadName: string
  status: CallStatus
  outcome: string
  duration: number
  notes?: string
  createdAt: Date
  followUp?: {
    scheduledFor: Date
    status: string
  }
}

export function CallHistory() {
  const [calls, setCalls] = useState<CallRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCallHistory()
  }, [])

  const fetchCallHistory = async () => {
    try {
      const response = await fetch("/api/telecaller/calls/history")
      const data = await response.json()
      setCalls(data)
    } catch (error) {
      console.error("Failed to fetch call history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCallIcon = (status: CallStatus) => {
    switch (status) {
      case "CONNECTED":
        return <Phone className="h-4 w-4 text-green-500" />
      case "NO_ANSWER":
        return <PhoneMissed className="h-4 w-4 text-yellow-500" />
      case "WRONG_NUMBER":
      case "BUSY":
        return <PhoneOff className="h-4 w-4 text-red-500" />
      default:
        return <Phone className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: CallStatus) => {
    switch (status) {
      case "CONNECTED":
        return <Badge variant="default">Connected</Badge>
      case "NO_ANSWER":
        return <Badge variant="outline">No Answer</Badge>
      case "WRONG_NUMBER":
        return <Badge variant="destructive">Wrong Number</Badge>
      case "BUSY":
        return <Badge variant="secondary">Busy</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4">
        {calls.map((call) => (
          <div
            key={call.id}
            className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-10 w-10">
              {getCallIcon(call.status)}
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{call.leadName}</p>
                {getStatusBadge(call.status)}
                {call.followUp && (
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    Follow-up Scheduled
                  </Badge>
                )}
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {call.notes || call.outcome}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{call.notes || call.outcome}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}</span>
                {call.duration > 0 && (
                  <span>Duration: {formatDuration(call.duration)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
        {!isLoading && calls.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No calls recorded yet
          </div>
        )}
      </div>
    </ScrollArea>
  )
}