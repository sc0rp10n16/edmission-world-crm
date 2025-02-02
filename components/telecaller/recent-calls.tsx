// components/telecaller/recent-calls.tsx
"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar } from "@/components/ui/avatar"
import { Phone, PhoneOff, PhoneMissed } from "lucide-react"

interface Call {
  id: string
  leadName: string
  status: string
  duration: number
  createdAt: Date
  outcome: string
}

export function RecentCalls() {
  const [calls, setCalls] = useState<Call[]>([])

  useEffect(() => {
    // Fetch recent calls
    RecentCalls()
  }, [])

  const getCallIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <Phone className="h-4 w-4 text-green-500" />
      case 'NO_ANSWER':
        return <PhoneMissed className="h-4 w-4 text-yellow-500" />
      default:
        return <PhoneOff className="h-4 w-4 text-red-500" />
    }
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {calls.map((call) => (
          <div key={call.id} className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              {getCallIcon(call.status)}
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">{call.leadName}</p>
              <p className="text-sm text-muted-foreground">{call.outcome}</p>
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}