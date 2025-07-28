"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  formatStr?: string
}

const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  ({ 
    date, 
    onDateChange, 
    placeholder = "Pick a date",
    disabled = false,
    className,
    formatStr = "PPP",
    ...props 
  }, ref) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
            {...props}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, formatStr) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    )
  }
)
DatePicker.displayName = "DatePicker"

interface DateRangePickerProps {
  from?: Date
  to?: Date
  onFromChange?: (date: Date | undefined) => void
  onToChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  formatStr?: string
}

const DateRangePicker = React.forwardRef<HTMLDivElement, DateRangePickerProps>(
  ({ 
    from,
    to,
    onFromChange,
    onToChange,
    placeholder = "Pick a date range",
    disabled = false,
    className,
    formatStr = "LLL dd, y",
    ...props 
  }, ref) => {
    return (
      <div ref={ref} className={cn("flex gap-2", className)} {...props}>
        <DatePicker
          date={from}
          onDateChange={onFromChange}
          placeholder="From date"
          disabled={disabled}
          formatStr={formatStr}
        />
        <DatePicker
          date={to}
          onDateChange={onToChange}
          placeholder="To date"
          disabled={disabled}
          formatStr={formatStr}
        />
      </div>
    )
  }
)
DateRangePicker.displayName = "DateRangePicker"

export { DatePicker, DateRangePicker }
