"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Phone, User, Calendar } from "lucide-react"
import { LeadColumn } from "./columns"
import { CallForm } from "./call-form"
import { formatPhoneNumber } from "@/lib/utils" // You'll need to create this
import { useQueryClient } from "@tanstack/react-query"

export function CallDialog({ lead }: { lead: LeadColumn }) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const handleSuccess = () => {
    // Invalidate and refetch leads after a successful call log
    queryClient.invalidateQueries({ queryKey: ['leads'] })
    setOpen(false)
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Phone className="h-4 w-4 mr-2" />
        Call
      </Button>
      
      <DialogContent className="max-w-xl">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-bold tracking-tight">
                Call {lead.name}
              </DialogTitle>
              <DialogDescription>
                Record the outcome of your call
              </DialogDescription>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Phone className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 px-2 py-3 bg-secondary/20 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="h-4 w-4 mr-2" />
                Contact Details
              </div>
              <div className="font-medium">{formatPhoneNumber(lead.phone)}</div>
              {lead.email && (
                <div className="text-sm text-muted-foreground">{lead.email}</div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Last Contact
              </div>
              <div className="font-medium">
                {lead.lastContactedAt 
                  ? new Date(lead.lastContactedAt).toLocaleDateString()
                  : "Never contacted"}
              </div>
              <div className="text-sm text-muted-foreground">
                {lead.totalCallAttempts} previous attempts
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          <CallForm 
            lead={lead} 
            onSuccess={() => setOpen(false)} 
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
