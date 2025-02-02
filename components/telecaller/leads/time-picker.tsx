"use client"
 
import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { TimePickerInput } from "./time-picker-input"
 
interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}
 
export function TimePicker({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)
  const [hour, setHour] = React.useState(date ? date.getHours() : 0)
  const [minute, setMinute] = React.useState(date ? date.getMinutes() : 0)
 
  React.useEffect(() => {
    if (date) {
      setHour(date.getHours())
      setMinute(date.getMinutes())
    }
  }, [date])
 
  const handleTimeChange = React.useCallback((type: "hour" | "minute", value: number) => {
    if (date) {
      const newDate = new Date(date)
      if (type === "hour") {
        newDate.setHours(value)
        setHour(value)
      } else {
        newDate.setMinutes(value)
        setMinute(value)
      }
      setDate(newDate)
    }
  }, [date, setDate])
 
  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">Hours</Label>
        <TimePickerInput
          ref={hourRef}
          value={hour}
          onChange={(value) => handleTimeChange("hour", value)}
          max={23}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") {
              minuteRef.current?.focus()
            }
          }}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">Minutes</Label>
        <TimePickerInput
          ref={minuteRef}
          value={minute}
          onChange={(value) => handleTimeChange("minute", value)}
          max={59}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              hourRef.current?.focus()
            }
          }}
        />
      </div>
      <div className="flex items-center self-center pb-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}