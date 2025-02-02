// components/telecaller/leads/time-picker-input.tsx
"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">

interface TimePickerInputProps extends InputProps {
  value?: number
  onChange?: (value: number) => void
  max?: number
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  ({ className, value, onChange, max = 59, ...props }, ref) => {
    const [stringValue, setStringValue] = React.useState<string>(
      value?.toString().padStart(2, "0") ?? "00"
    )

    React.useEffect(() => {
      setStringValue(value?.toString().padStart(2, "0") ?? "00")
    }, [value])

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value
      const numericValue = parseInt(newValue, 10)

      if (isNaN(numericValue)) {
        setStringValue("00")
        onChange?.(0)
        return
      }

      if (numericValue >= 0 && numericValue <= max) {
        setStringValue(numericValue.toString().padStart(2, "0"))
        onChange?.(numericValue)
      }
    }

    return (
      <Input
        {...props}
        ref={ref}
        value={stringValue}
        onChange={handleChange}
        className={cn(
          "w-14 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
      />
    )
  }
)
TimePickerInput.displayName = "TimePickerInput"

export { TimePickerInput }