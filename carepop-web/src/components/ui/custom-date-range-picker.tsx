"use client"

import * as React from "react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CustomDatePicker } from "./custom-date-picker"

interface CustomDateRangePickerProps {
  date: DateRange | undefined
  setDate: (date: DateRange | undefined) => void
  className?: string
  startYear?: number
  endYear?: number
}

export function CustomDateRangePicker({
  date,
  setDate,
  className,
  startYear = 2020,
  endYear = 2030
}: CustomDateRangePickerProps) {
  const [fromDate, setFromDate] = React.useState<Date | undefined>(date?.from)
  const [toDate, setToDate] = React.useState<Date | undefined>(date?.to)

  const handleFromDateChange = (newDate: Date | undefined) => {
    setFromDate(newDate)
    setDate({
      from: newDate,
      to: toDate
    })
  }

  const handleToDateChange = (newDate: Date | undefined) => {
    setToDate(newDate)
    setDate({
      from: fromDate,
      to: newDate
    })
  }

  const setToday = () => {
    const today = new Date()
    setFromDate(today)
    setToDate(today)
    setDate({ from: today, to: today })
  }

  const setThisWeek = () => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
    setFromDate(startOfWeek)
    setToDate(endOfWeek)
    setDate({ from: startOfWeek, to: endOfWeek })
  }

  const setThisMonth = () => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    setFromDate(startOfMonth)
    setToDate(endOfMonth)
    setDate({ from: startOfMonth, to: endOfMonth })
  }

  const setYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    setFromDate(yesterday)
    setToDate(yesterday)
    setDate({ from: yesterday, to: yesterday })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
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
        <PopoverContent className="w-auto p-4" align="end">
          <div className="flex flex-col space-y-4">
            {/* Quick select presets */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={setToday}>
                Today
              </Button>
              <Button size="sm" variant="outline" onClick={setThisWeek}>
                This Week
              </Button>
              <Button size="sm" variant="outline" onClick={setThisMonth}>
                This Month
              </Button>
              <Button size="sm" variant="outline" onClick={setYesterday}>
                Yesterday
              </Button>
            </div>
            
            {/* Date range selection */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">From Date</label>
                <div className="w-full">
                  <CustomDatePicker
                    date={fromDate}
                    setDate={handleFromDateChange}
                    placeholder="Start date"
                    startYear={startYear}
                    endYear={endYear}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium">To Date</label>
                <div className="w-full">
                  <CustomDatePicker
                    date={toDate}
                    setDate={handleToDateChange}
                    placeholder="End date"
                    startYear={startYear}
                    endYear={endYear}
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 