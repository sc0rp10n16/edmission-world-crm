// components/telecaller/leads/call-form.tsx
"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { CallStatus, LeadStatus } from "@prisma/client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { LeadColumn } from "./columns"
import { Phone, XCircle, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useQueryClient } from "@tanstack/react-query"

const COUNTRIES = [
  "USA",
  "UK",
  "Canada",
  "Australia",
  "New Zealand",
  "Ireland",
  "Germany",
  "France",
  "Dubai",
  "Singapore",
] as const

const callFormSchema = z.object({
  callStatus: z.nativeEnum(CallStatus),
  leadStatus: z.nativeEnum(LeadStatus).optional(),
  preferredCountry: z.string().optional(),
  counsellorId: z.string().optional(),
  needsCounsellor: z.boolean().optional(),
  followUpDateTime: z.date().optional(),
  notes: z.string().min(1, "Please provide notes about the call"),
})

type CallFormValues = z.infer<typeof callFormSchema>

interface Counsellor {
  id: string
  name: string
  email: string
}

interface CallFormProps {
  lead: LeadColumn
  onSuccess: () => void
}

export function CallForm({ lead, onSuccess }: CallFormProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [counsellors, setCounsellors] = useState<Counsellor[]>([])

  const form = useForm<CallFormValues>({
    resolver: zodResolver(callFormSchema),
    defaultValues: {
      notes: "",
      needsCounsellor: false,
    },
  })

  const watchCallStatus = form.watch("callStatus")
  const watchLeadStatus = form.watch("leadStatus")
  const watchNeedsCounsellor = form.watch("needsCounsellor")

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        const response = await fetch('/api/counsellors')
        if (!response.ok) throw new Error('Failed to fetch counsellors')
        const data = await response.json()
        setCounsellors(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load counsellors",
          variant: "destructive",
        })
      }
    }

    fetchCounsellors()
  }, [toast])

  async function onSubmit(data: CallFormValues) {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/telecallers/leads/${lead.id}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Failed to log call")
      
      await queryClient.invalidateQueries({ queryKey: ['leads'] })

      toast({
        title: "Success",
        description: "Call details have been saved",
      })
      onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save call details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6">
          <div className="bg-secondary/10 p-6 rounded-lg space-y-6">
            {/* Call Status Field */}
            <FormField
              control={form.control}
              name="callStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Call Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="How did the call go?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CONNECTED">
                        <div className="flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                          Connected
                        </div>
                      </SelectItem>
                      <SelectItem value="NO_ANSWER">
                        <div className="flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-yellow-500" />
                          No Answer
                        </div>
                      </SelectItem>
                      <SelectItem value="BUSY">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-orange-500" />
                          Busy
                        </div>
                      </SelectItem>
                      <SelectItem value="WRONG_NUMBER">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
                          Wrong Number
                        </div>
                      </SelectItem>
                      <SelectItem value="SCHEDULED_CALLBACK">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-blue-500" />
                          Schedule Callback
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {watchCallStatus === "CONNECTED" && (
            <div className="bg-secondary/10 p-6 rounded-lg space-y-6">
              <FormField
                control={form.control}
                name="leadStatus"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-lg font-semibold">Call Outcome</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-4"
                      >
                        <FormItem className={cn(
                          "relative flex items-center justify-center space-x-2 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                          field.value === "INTERESTED" && "border-green-500 bg-green-50/50"
                        )}>
                          <FormControl>
                            <RadioGroupItem value="INTERESTED" className="absolute top-2 left-2" />
                          </FormControl>
                          <div className="text-center">
                            <CheckCircle2 className="h-8 w-8 mb-2 mx-auto text-green-500" />
                            <FormLabel className="font-medium cursor-pointer">Interested</FormLabel>
                          </div>
                        </FormItem>

                        <FormItem className={cn(
                          "relative flex items-center justify-center space-x-2 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                          field.value === "NOT_INTERESTED" && "border-red-500 bg-red-50/50"
                        )}>
                          <FormControl>
                            <RadioGroupItem value="NOT_INTERESTED" className="absolute top-2 left-2" />
                          </FormControl>
                          <div className="text-center">
                            <XCircle className="h-8 w-8 mb-2 mx-auto text-red-500" />
                            <FormLabel className="font-medium cursor-pointer">Not Interested</FormLabel>
                          </div>
                        </FormItem>

                        <FormItem className={cn(
                          "relative flex items-center justify-center space-x-2 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                          field.value === "FOLLOW_UP" && "border-yellow-500 bg-yellow-50/50"
                        )}>
                          <FormControl>
                            <RadioGroupItem value="FOLLOW_UP" className="absolute top-2 left-2" />
                          </FormControl>
                          <div className="text-center">
                            <Clock className="h-8 w-8 mb-2 mx-auto text-yellow-500" />
                            <FormLabel className="font-medium cursor-pointer">Needs Follow-up</FormLabel>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {watchCallStatus === "CONNECTED" && watchLeadStatus === "INTERESTED" && (
            <div className="bg-secondary/10 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold">Interest Details</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preferredCountry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="counsellorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Counsellor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select counsellor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {counsellors.map((counsellor) => (
                            <SelectItem key={counsellor.id} value={counsellor.id}>
                              {counsellor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {(watchCallStatus === "CONNECTED" && watchLeadStatus === "FOLLOW_UP") || 
           watchCallStatus === "SCHEDULED_CALLBACK" ? (
            <div className="bg-secondary/10 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-semibold">Follow-up Details</h3>
              <FormField
                control={form.control}
                name="needsCounsellor"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Follow-up Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        defaultValue={field.value?.toString()}
                        className="grid grid-cols-2 gap-4"
                      >
                        <FormItem className={cn(
                          "relative flex items-center justify-center space-x-2 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                          field.value === true && "border-blue-500 bg-blue-50/50"
                        )}>
                          <FormControl>
                            <RadioGroupItem value="true" className="absolute top-2 left-2" />
                          </FormControl>
                          <div className="text-center">
                            <AlertCircle className="h-8 w-8 mb-2 mx-auto text-blue-500" />
                            <FormLabel className="font-medium cursor-pointer">Need Counsellor</FormLabel>
                          </div>
                        </FormItem>
                        
                        <FormItem className={cn(
                          "relative flex items-center justify-center space-x-2 rounded-lg border-2 p-4 cursor-pointer hover:bg-accent/50 transition-colors",
                          field.value === false && "border-blue-500 bg-blue-50/50"
                        )}>
                          <FormControl>
                            <RadioGroupItem value="false" className="absolute top-2 left-2" />
                          </FormControl>
                          <div className="text-center">
                            <Phone className="h-8 w-8 mb-2 mx-auto text-blue-500" />
                            <FormLabel className="font-medium cursor-pointer">Telecaller Follow-up</FormLabel>
                          </div>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchNeedsCounsellor && (
                <FormField
                  control={form.control}
                  name="counsellorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Counsellor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select counsellor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {counsellors.map((counsellor) => (
                            <SelectItem key={counsellor.id} value={counsellor.id}>
                              {counsellor.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="followUpDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Follow-up</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <ReactDatePicker
                          selected={field.value}
                          onChange={(date: Date | null) => field.onChange(date)}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="MMMM d, yyyy h:mm aa"
                          minDate={new Date()}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholderText="Select date and time"
                          wrapperClassName="w-full"
                        />
                        <Clock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}

          <div className="bg-secondary/10 p-6 rounded-lg">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add detailed notes about the conversation..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            className="w-[100px]"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Saving</span>
              </div>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}