// hooks/use-realtime-notifications.ts
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function useRealtimeNotifications() {
  const { toast } = useToast()

  useEffect(() => {
    const eventSource = new EventSource('/api/telecallers/notifications/stream')

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      toast({
        title: notification.title,
        description: notification.message,
      })
    }

    return () => eventSource.close()
  }, [])
}