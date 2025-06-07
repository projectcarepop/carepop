"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CustomDatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  placeholder?: string
  startYear?: number
  endYear?: number
}

export function CustomDatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  startYear = 2020,
  endYear = 2030
}: CustomDatePickerProps) {

  const handleDayChange = (day: string) => {
    const currentYear = date?.getFullYear() || new Date().getFullYear();
    const currentMonth = date?.getMonth() || 0;
    const newDate = new Date(currentYear, currentMonth, parseInt(day));
    
    // Check if the date is valid (e.g., not Feb 31)
    if (newDate.getMonth() !== currentMonth) {
      // Invalid date, maybe show an error or just don't update
      return; 
    }
    setDate(newDate);
  };

  const handleMonthChange = (monthIndex: string) => {
    const currentYear = date?.getFullYear() || new Date().getFullYear();
    const currentDay = date?.getDate() || 1;
    const newDate = new Date(currentYear, parseInt(monthIndex), currentDay);

    // If the day is invalid for the new month, adjust it
    if (newDate.getMonth() !== parseInt(monthIndex)) {
      setDate(new Date(currentYear, parseInt(monthIndex) + 1, 0)); // last day of prev month
    } else {
      setDate(newDate);
    }
  };

  const handleYearChange = (year: string) => {
    const currentMonth = date?.getMonth() || 0;
    const currentDay = date?.getDate() || 1;
    const newDate = new Date(parseInt(year), currentMonth, currentDay);

    // If the day is invalid for the new month/year (e.g. leap year), adjust it
    if (newDate.getMonth() !== currentMonth) {
      setDate(new Date(parseInt(year), currentMonth + 1, 0));
    } else {
      setDate(newDate);
    }
  };

  const months = [
    { value: "0", label: "January" },
    { value: "1", label: "February" },
    { value: "2", label: "March" },
    { value: "3", label: "April" },
    { value: "4", label: "May" },
    { value: "5", label: "June" },
    { value: "6", label: "July" },
    { value: "7", label: "August" },
    { value: "8", label: "September" },
    { value: "9", label: "October" },
    { value: "10", label: "November" },
    { value: "11", label: "December" },
  ];

  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );
  
  const daysInMonth = date ? new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[200px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Month</label>
            <Select value={date ? date.getMonth().toString() : undefined} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Day</label>
            <Select value={date ? date.getDate().toString() : undefined} onValueChange={handleDayChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {days.map((day) => (
                    <SelectItem key={day} value={day.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Year</label>
            <Select value={date ? date.getFullYear().toString() : undefined} onValueChange={handleYearChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-[200px]">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </ScrollArea>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 