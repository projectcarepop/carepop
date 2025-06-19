"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  isTimeBlocked?: (date: Date) => boolean;
}

export function TimePicker({ date, setDate, isTimeBlocked }: TimePickerProps) {
  const handleHourChange = (value: string) => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(parseInt(value, 10));
    setDate(newDate);
  };

  const handleMinuteChange = (value: string) => {
    const newDate = date ? new Date(date) : new Date();
    newDate.setMinutes(parseInt(value, 10));
    setDate(newDate);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 4 }, (_, i) => i * 15);

  return (
    <div className="flex items-center space-x-2">
      <Select
        value={date ? date.getHours().toString() : ""}
        onValueChange={handleHourChange}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((hour) => {
            const tempDate = date ? new Date(date) : new Date();
            tempDate.setHours(hour, 0, 0, 0);
            const disabled = isTimeBlocked ? isTimeBlocked(tempDate) : false;
            return (
              <SelectItem key={hour} value={hour.toString()} disabled={disabled}>
                {hour.toString().padStart(2, "0")}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <span>:</span>
      <Select
        value={date ? date.getMinutes().toString() : ""}
        onValueChange={handleMinuteChange}
      >
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((minute) => {
             const tempDate = date ? new Date(date) : new Date();
             tempDate.setMinutes(minute, 0, 0);
             const disabled = isTimeBlocked ? isTimeBlocked(tempDate) : false;
            return (
              <SelectItem key={minute} value={minute.toString()} disabled={disabled}>
                {minute.toString().padStart(2, "0")}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
} 