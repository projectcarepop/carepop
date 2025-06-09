'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProviderFormValues } from './providerForm-types';

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

interface AvailabilityManagerProps {
  form: UseFormReturn<ProviderFormValues>;
}

export function AvailabilityManager({ form }: AvailabilityManagerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {daysOfWeek.map((day) => {
          const dayId = day.id as keyof ProviderFormValues['weeklyAvailability'];
          return (
            <div key={day.id} className="flex items-center space-x-4 p-3 border rounded-md">
              <Checkbox
                id={`${dayId}-active`}
                checked={form.watch(`weeklyAvailability.${dayId}.isActive`)}
                onCheckedChange={(checked) => {
                  form.setValue(`weeklyAvailability.${dayId}.isActive`, !!checked, { shouldDirty: true });
                }}
              />
              <Label htmlFor={`${dayId}-active`} className="flex-1 font-semibold">
                {day.label}
              </Label>
              {form.watch(`weeklyAvailability.${dayId}.isActive`) && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    className="w-32"
                    {...form.register(`weeklyAvailability.${dayId}.startTime`)}
                  />
                  <span>-</span>
                  <Input
                    type="time"
                    className="w-32"
                    {...form.register(`weeklyAvailability.${dayId}.endTime`)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
} 