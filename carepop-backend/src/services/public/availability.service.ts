import { supabase } from '../../lib/supabase/public-client';
import { AppError } from '../../lib/utils/appError';

interface ITimeSlot {
  startTime: string;
  endTime: string;
}

const SLOT_DURATION_MINUTES = 30; // Assuming a fixed 30-minute slot duration for now

/**
 * Generates time slots within a given range.
 * @param start - The start time (e.g., "09:00:00").
 * @param end - The end time (e.g., "17:00:00").
 * @param duration - The duration of each slot in minutes.
 * @returns An array of time slots.
 */
function generateTimeSlots(start: string, end: string, duration: number): ITimeSlot[] {
  const slots: ITimeSlot[] = [];
  let currentTime = new Date(`1970-01-01T${start}Z`);
  const endTime = new Date(`1970-01-01T${end}Z`);

  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    if (slotEnd > endTime) break;

    slots.push({
      startTime: currentTime.toUTCString().substring(17, 25),
      endTime: slotEnd.toUTCString().substring(17, 25),
    });
    currentTime = slotEnd;
  }
  return slots;
}

/**
 * Calculates available appointment slots for a provider on a specific date for a given service.
 *
 * @param providerId - The UUID of the provider.
 * @param serviceId - The UUID of the service.
 * @param date - The date for which to calculate availability (YYYY-MM-DD).
 * @returns A promise that resolves to an array of available time slots.
 */
export async function getProviderAvailability(
  providerId: string,
  serviceId: string,
  date: string
): Promise<ITimeSlot[]> {
  const dayOfWeek = new Date(date).getDay(); // 0 = Sunday, 1 = Monday, etc.

  // 1. Get the provider's recurring weekly schedule for that day and service
  const { data: weeklySchedules, error: scheduleError } = await supabase
    .from('provider_weekly_schedules')
    .select('start_time, end_time')
    .eq('provider_id', providerId)
    .eq('service_id', serviceId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_active', true);

  if (scheduleError) {
    throw new AppError('Failed to fetch provider weekly schedule.', 500, scheduleError);
  }

  // 2. Get all overrides for that specific date
  const { data: overrides, error: overrideError } = await supabase
    .from('provider_availability_overrides')
    .select('start_time, end_time, is_available, service_id')
    .eq('provider_id', providerId)
    .eq('override_date', date);

  if (overrideError) {
    throw new AppError('Failed to fetch provider availability overrides.', 500, overrideError);
  }
  
  let availableSlots: ITimeSlot[] = [];

  // Generate base slots from the weekly schedule
  for (const schedule of weeklySchedules) {
    availableSlots.push(...generateTimeSlots(schedule.start_time, schedule.end_time, SLOT_DURATION_MINUTES));
  }
  
  // Apply overrides
  const dateObj = new Date(date);

  // Apply additions first
  const additions = overrides.filter(o => o.is_available && (o.service_id === serviceId || o.service_id === null));
  for (const addition of additions) {
    availableSlots.push(...generateTimeSlots(addition.start_time, addition.end_time, SLOT_DURATION_MINUTES));
  }

  // Apply block-offs (for this service or all services)
  const blockOffs = overrides.filter(o => !o.is_available && (o.service_id === serviceId || o.service_id === null));
  availableSlots = availableSlots.filter(slot => {
    const slotStart = new Date(`${date}T${slot.startTime}`).getTime();
    const slotEnd = new Date(`${date}T${slot.endTime}`).getTime();
    
    for (const block of blockOffs) {
        const blockStart = new Date(`${date}T${block.start_time}`).getTime();
        const blockEnd = new Date(`${date}T${block.end_time}`).getTime();
        // Check for any overlap
        if (slotStart < blockEnd && slotEnd > blockStart) {
            return false; // This slot is blocked
        }
    }
    return true;
  });

  // 3. TODO: Get already booked appointments for that day and filter them out

  // Remove duplicates and sort
  const uniqueSlots = Array.from(new Map(availableSlots.map(slot => [slot.startTime, slot])).values());
  uniqueSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

  return uniqueSlots;
} 