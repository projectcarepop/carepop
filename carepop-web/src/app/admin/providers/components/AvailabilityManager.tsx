'use client';

import React from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { ProviderFormValues } from './providerForm-types';

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

type AvailabilityManagerProps = {
  name: "weeklyAvailability"; 
};

export const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ name }) => {
  const { control, getValues, setValue } = useFormContext<ProviderFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const handleDayToggle = (day: string, checked: boolean) => {
    const dayIndex = fields.findIndex(field => field.day === day);
    if (checked && dayIndex === -1) {
      append({ day, slots: [{ startTime: '09:00', endTime: '17:00' }] });
    } else if (!checked && dayIndex !== -1) {
      remove(dayIndex);
    }
  };

  const addSlot = (dayIndex: number) => {
    const daySlots = getValues(`${name}.${dayIndex}.slots`);
    setValue(`${name}.${dayIndex}.slots`, [...daySlots, { startTime: '', endTime: '' }]);
  };

  const removeSlot = (dayIndex: number, slotIndex: number) => {
    const daySlots = getValues(`${name}.${dayIndex}.slots`);
    setValue(`${name}.${dayIndex}.slots`, daySlots.filter((_, i: number) => i !== slotIndex));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Available Days</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {daysOfWeek.map(day => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day}`}
                  checked={fields.some(field => field.day === day)}
                  onCheckedChange={(checked) => handleDayToggle(day, !!checked)}
                />
                <Label htmlFor={`day-${day}`}>{day}</Label>
              </div>
            ))}
          </div>
        </div>

        {fields.map((field, dayIndex) => (
          <div key={field.id} className="p-4 border rounded-md space-y-4">
            <h4 className="font-semibold">{field.day}</h4>
            {field.slots.map((slot, slotIndex: number) => (
                <div key={slotIndex} className="flex items-center gap-4">
                    <div className="flex-1">
                        <Label htmlFor={`${name}.${dayIndex}.slots.${slotIndex}.startTime`}>Start Time</Label>
                        <Controller
                            control={control}
                            name={`${name}.${dayIndex}.slots.${slotIndex}.startTime`}
                            render={({ field }) => <Input type="time" {...field} />}
                        />
                    </div>
                    <div className="flex-1">
                        <Label htmlFor={`${name}.${dayIndex}.slots.${slotIndex}.endTime`}>End Time</Label>
                         <Controller
                            control={control}
                            name={`${name}.${dayIndex}.slots.${slotIndex}.endTime`}
                            render={({ field }) => <Input type="time" {...field} />}
                        />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSlot(dayIndex, slotIndex)} className="self-end">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
             <Button type="button" variant="outline" size="sm" onClick={() => addSlot(dayIndex)}>
              Add Time Slot
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}; 