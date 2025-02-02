// components/telecaller/calendar-view.tsx
"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [showEvents, setShowEvents] = useState(false)

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date)
            setShowEvents(true)
          }}
          className="rounded-md border"
        />
      </div>
      
      <Dialog open={showEvents} onOpenChange={setShowEvents}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Schedule for {selectedDate?.toLocaleDateString()}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px]">
            {/* Add scheduled calls and follow-ups here */}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}