// components/telecaller/call-log-form.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select"

interface CallLogFormProps {
  leadId: string
  onClose: () => void
}

export function CallLogForm({ leadId, onClose }: CallLogFormProps) {
  const [callStatus, setCallStatus] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [followUpDate, setFollowUpDate] = useState<Date | undefined>()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Add API call to save call log
    onClose()
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Log Call Details</DialogTitle>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select 
          value={callStatus} 
          onValueChange={setCallStatus}
        >
          <SelectTrigger>
            <SelectValue placeholder="Call Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="interested">Interested</SelectItem>
            <SelectItem value="not-interested">Not Interested</SelectItem>
            <SelectItem value="follow-up">Needs Follow-up</SelectItem>
            <SelectItem value="no-answer">No Answer</SelectItem>
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Call Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">Follow-up Date</label>
          <Calendar
            mode="single"
            selected={followUpDate}
            onSelect={setFollowUpDate}
            disabled={(date) => date < new Date()}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Log</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}