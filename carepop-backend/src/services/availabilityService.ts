import { supabaseServiceRole } from '../config/supabaseClient';
import logger from '../utils/logger';
import { 
    GetProviderAvailabilityQuery, 
    ProviderAvailabilityResponse, 
    AvailabilitySlot,
    ProviderWorkingBlock
} from '../types/availabilityTypes';
import { Service } from '../types/serviceTypes'; // Assuming this type includes typical_duration_minutes
import { Appointment } from '../types/appointmentTypes'; // For fetching existing appointments

const DEFAULT_SLOT_INTERVAL_MINUTES = 15; // Default granularity if needed for slot generation logic

interface ProviderSchedule {
    day_of_week?: number; // For weekly
    override_date?: string; // YYYY-MM-DD for overrides
    start_time: string; // HH:MM:SS
    end_time: string;   // HH:MM:SS
    is_available?: boolean; // For overrides
}

/**
 * Calculates and returns available appointment slots for a provider.
 * MVP Simplifications:
 * - Assumes all times from DB (schedules, overrides) are in a consistent timezone (e.g., UTC or can be treated as such).
 * - Date/time calculations are performed primarily using JS Date objects, which work with system time or UTC.
 * - Assumes startDate and endDate query params define a range in a consistent timezone (e.g., client's local, to be converted or handled).
 * - Does not yet handle complex recurring exceptions beyond simple date overrides.
 */
export const getProviderAvailability = async (
    providerId: string,
    params: GetProviderAvailabilityQuery
): Promise<ProviderAvailabilityResponse> => {
    const { clinicId, serviceId, startDate, endDate } = params;
    logger.info(`[getProviderAvailability] Fetching availability for provider: ${providerId}, clinic: ${clinicId}, service: ${serviceId} from ${startDate} to ${endDate}`);

    try {
        // 1. Fetch Service Duration
        const { data: serviceData, error: serviceError } = await supabaseServiceRole
            .from('services')
            .select('id, typical_duration_minutes')
            .eq('id', serviceId)
            .single();

        if (serviceError || !serviceData || !serviceData.typical_duration_minutes) {
            logger.error(`[getProviderAvailability] Error fetching service or service duration: ${serviceError?.message || 'Service not found or no duration'}`);
            throw new Error('Service not found or service duration not defined.');
        }
        const serviceDurationMinutes = serviceData.typical_duration_minutes;

        // 2. Fetch Provider's Weekly Schedules for the clinic
        const { data: weeklySchedulesData, error: weeklySchedulesError } = await supabaseServiceRole
            .from('provider_weekly_schedules')
            .select('day_of_week, start_time, end_time')
            .eq('provider_id', providerId)
            .eq('clinic_id', clinicId)
            .eq('is_active', true);

        if (weeklySchedulesError) {
            logger.error(`[getProviderAvailability] Error fetching weekly schedules: ${weeklySchedulesError.message}`);
            throw new Error('Could not fetch provider weekly schedules.');
        }

        // 3. Fetch Provider's Schedule Overrides for the date range
        const { data: scheduleOverridesData, error: scheduleOverridesError } = await supabaseServiceRole
            .from('provider_schedule_overrides')
            .select('override_date, start_time, end_time, is_available')
            .eq('provider_id', providerId)
            .or(`clinic_id.eq.${clinicId},clinic_id.is.null`) // Clinic specific or general override
            .gte('override_date', startDate)
            .lte('override_date', endDate);

        if (scheduleOverridesError) {
            logger.error(`[getProviderAvailability] Error fetching schedule overrides: ${scheduleOverridesError.message}`);
            throw new Error('Could not fetch provider schedule overrides.');
        }
        
        // 4. Fetch Provider's Existing Appointments for the date range
        // Construct ISO strings for the start and end of the date range for TIMESTAMPTZ query
        const rangeStartISO = new Date(startDate + 'T00:00:00Z').toISOString();
        const rangeEndISO = new Date(endDate + 'T23:59:59.999Z').toISOString();

        const { data: appointmentsData, error: appointmentsError } = await supabaseServiceRole
            .from('appointments')
            .select('appointment_datetime, duration_minutes')
            .eq('provider_id', providerId)
            .eq('clinic_id', clinicId) // Appointments are clinic-specific
            .in('status', ['confirmed', 'pending_confirmation']) // Consider only confirmed/pending appointments
            .gte('appointment_datetime', rangeStartISO)
            .lte('appointment_datetime', rangeEndISO);

        if (appointmentsError) {
            logger.error(`[getProviderAvailability] Error fetching appointments: ${appointmentsError.message}`);
            throw new Error('Could not fetch provider appointments.');
        }

        // --- Core Availability Calculation Logic ---
        const availabilityByDate: ProviderAvailabilityResponse = [];
        const currentDate = new Date(startDate + 'T00:00:00Z');
        const finalEndDate = new Date(endDate + 'T00:00:00Z');

        while (currentDate <= finalEndDate) {
            const dayOfWeek = currentDate.getUTCDay(); // 0 (Sun) to 6 (Sat)
            const currentDateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD in UTC

            let workingBlocks: ProviderWorkingBlock[] = [];

            // Apply overrides for the current date first
            const overridesForDay = scheduleOverridesData?.filter(ov => ov.override_date === currentDateStr) || [];
            
            if (overridesForDay.length > 0) {
                overridesForDay.forEach(override => {
                    if (override.is_available && override.start_time && override.end_time) {
                        const startDateTime = new Date(`${currentDateStr}T${override.start_time}Z`);
                        const endDateTime = new Date(`${currentDateStr}T${override.end_time}Z`);
                        if (startDateTime < endDateTime) {
                            workingBlocks.push({ start: startDateTime, end: endDateTime });
                        }
                    } else if (!override.is_available && override.start_time && override.end_time) {
                        // This is a block of UNAVAILABILITY. We'll handle this by removing it from general working blocks later.
                        // For now, this means if an override says "unavailable 12-1pm", we don't add that as a working block.
                        // If the override is "unavailable ALL DAY" (start/end null), workingBlocks remains empty unless another override adds availability.
                    } else if (!override.is_available && !override.start_time && !override.end_time) {
                        // Explicitly unavailable for the whole day via override
                        workingBlocks = []; // Clear any potential working blocks
                        // Short-circuit: if fully unavailable by override, no need to check weekly schedule
                        // However, another override could add specific availability, so we process all overrides.
                    }
                });
                // If any 'is_available: false' with start/end times, those need to be subtracted from 'is_available: true' blocks.
                // This part needs refinement if multiple conflicting overrides exist.
                // For MVP: Assume simple overrides: one full day off, or one specific block of availability.
                // If an "unavailable full day" override exists, it trumps weekly schedule.
                const fullDayUnavailableOverride = overridesForDay.find(ov => !ov.is_available && !ov.start_time && !ov.end_time);
                if (fullDayUnavailableOverride && workingBlocks.length === 0) { // if workingBlocks not populated by an availability override
                     // Day is off, skip to next day
                    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                    continue;
                }

            } else { // No overrides for this day, use weekly schedule
                const weeklyScheduleForDay = weeklySchedulesData?.find(ws => ws.day_of_week === dayOfWeek);
                if (weeklyScheduleForDay) {
                    const startDateTime = new Date(`${currentDateStr}T${weeklyScheduleForDay.start_time}Z`);
                    const endDateTime = new Date(`${currentDateStr}T${weeklyScheduleForDay.end_time}Z`);
                     if (startDateTime < endDateTime) {
                        workingBlocks.push({ start: startDateTime, end: endDateTime });
                    }
                }
            }
            
            // Refine working blocks: subtract specific unavailability overrides
            overridesForDay.forEach(override => {
                if (!override.is_available && override.start_time && override.end_time) {
                    const unavailableStart = new Date(`${currentDateStr}T${override.start_time}Z`);
                    const unavailableEnd = new Date(`${currentDateStr}T${override.end_time}Z`);
                    workingBlocks = workingBlocks.flatMap(block => {
                        // Case 1: Override is completely outside block -> keep block
                        if (unavailableEnd <= block.start || unavailableStart >= block.end) return [block];
                        // Case 2: Override completely contains block -> remove block
                        if (unavailableStart <= block.start && unavailableEnd >= block.end) return [];
                        // Case 3: Override splits block into two
                        if (unavailableStart > block.start && unavailableEnd < block.end) {
                            return [
                                { start: block.start, end: unavailableStart },
                                { start: unavailableEnd, end: block.end }
                            ];
                        }
                        // Case 4: Override truncates start of block
                        if (unavailableStart <= block.start && unavailableEnd > block.start && unavailableEnd < block.end) {
                            return [{ start: unavailableEnd, end: block.end }];
                        }
                        // Case 5: Override truncates end of block
                        if (unavailableStart > block.start && unavailableStart < block.end && unavailableEnd >= block.end) {
                            return [{ start: block.start, end: unavailableStart }];
                        }
                        return [block]; // Default, should be covered by above
                    }).filter(block => block.start < block.end); // Remove zero-duration blocks
                }
            });


            // Subtract existing appointments from working blocks
            const appointmentsForDay = appointmentsData?.filter(appt => 
                new Date(appt.appointment_datetime).toISOString().startsWith(currentDateStr)
            ) || [];

            appointmentsForDay.forEach(appt => {
                const apptStart = new Date(appt.appointment_datetime);
                const apptEnd = new Date(apptStart.getTime() + appt.duration_minutes * 60000);

                workingBlocks = workingBlocks.flatMap(block => {
                    if (apptEnd <= block.start || apptStart >= block.end) return [block]; // No overlap
                    if (apptStart <= block.start && apptEnd >= block.end) return [];      // Appointment covers block

                    const newBlocks: ProviderWorkingBlock[] = [];
                    if (apptStart > block.start) newBlocks.push({ start: block.start, end: apptStart });
                    if (apptEnd < block.end) newBlocks.push({ start: apptEnd, end: block.end });
                    return newBlocks;
                }).filter(block => block.start < block.end); // Filter out zero-duration blocks
            });

            // Carve out service slots from remaining working blocks
            const dailySlots: AvailabilitySlot[] = [];
            workingBlocks.forEach(block => {
                let slotStart = new Date(block.start.getTime());
                while (true) {
                    const slotEnd = new Date(slotStart.getTime() + serviceDurationMinutes * 60000);
                    if (slotEnd <= block.end) {
                        dailySlots.push({
                            startTime: slotStart.toISOString(),
                            endTime: slotEnd.toISOString()
                        });
                        // Advance to the next potential slot start time (can be configurable, e.g., every 15/30 mins or serviceDuration)
                        // For now, let's assume slots can start back-to-back or at a default interval like 15 mins
                        slotStart = new Date(slotStart.getTime() + DEFAULT_SLOT_INTERVAL_MINUTES * 60000); 
                        // A more robust way: slotStart = new Date(slotEnd.getTime()); if back-to-back
                        // Or slotStart = new Date(slotStart.getTime() + (serviceDurationMinutes * 60000)); if slots cannot overlap and are sequential
                        // Let's use DEFAULT_SLOT_INTERVAL_MINUTES for now, implying slots can be booked at these intervals
                    } else {
                        break; // Slot doesn't fit
                    }
                }
            });

            if (dailySlots.length > 0) {
                availabilityByDate.push({ date: currentDateStr, slots: dailySlots });
            }

            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        logger.info(`[getProviderAvailability] Successfully calculated availability for provider: ${providerId}`);
        return availabilityByDate;

    } catch (error: any) {
        logger.error(`[getProviderAvailability] General error: ${error.message}`, { error });
        // Consider re-throwing a more specific error or returning a structured error response
        throw error; // Re-throw for the controller to handle
    }
};

// Helper function (example, might not be needed if logic is simple or use a date library)
// function addMinutes(date: Date, minutes: number): Date {
//     return new Date(date.getTime() + minutes * 60000);
// } 