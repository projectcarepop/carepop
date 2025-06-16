"use client"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/calendar"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import * as React from "react"

interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value instanceof Date && !isNaN(value.getTime()) ? (
            format(value, "PPP")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
