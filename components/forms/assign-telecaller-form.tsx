"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
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

const formSchema = z.object({
  telecallerId: z.string().min(1, "Please select a telecaller"),
})

interface AssignTelecallerFormProps {
  managerId: string
  onSuccess: () => void
}

export function AssignTelecallerForm({
  managerId,
  onSuccess,
}: AssignTelecallerFormProps) {
  const [loading, setLoading] = useState(false)
  const [telecallers, setTelecallers] = useState([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  // Fetch available telecallers
  useEffect(() => {
    fetch('/api/telecallers')
      .then(res => res.json())
      .then(data => setTelecallers(data))
  }, [])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true)
      const response = await fetch(`/api/managers/${managerId}/telecallers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telecallerId: values.telecallerId,
        }),
      })

      if (!response.ok) throw new Error('Failed to assign telecaller')

      onSuccess()
      form.reset()
    } catch (error) {
      console.error('Error assigning telecaller:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="telecallerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Telecaller</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a telecaller" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {telecallers.map((telecaller: any) => (
                    <SelectItem key={telecaller.id} value={telecaller.id}>
                      {telecaller.name} ({telecaller.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Assigning..." : "Assign Telecaller"}
          </Button>
        </div>
      </form>
    </Form>
  )
}