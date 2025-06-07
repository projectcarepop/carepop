"use client"

import * as React from "react"
import { addDays, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate
}: DateRangePickerProps) {
  const presets = [
    { name: "Today", range: { from: new Date(), to: new Date() } },
    { name: "Last 7 days", range: { from: addDays(new Date(), -6), to: new Date() } },
    { name: "This week", range: { from: startOfWeek(new Date()), to: endOfWeek(new Date()) } },
    { name: "This month", range: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 flex" align="end">
            <div className="flex flex-col space-y-2 p-3">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="ghost"
                  onClick={() => setDate(preset.range)}
                  className="justify-start"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
            <div className="h-auto w-px bg-border" />
            <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
            />
        </PopoverContent>
      </Popover>
    </div>
  )
} 