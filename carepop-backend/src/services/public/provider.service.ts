import { supabase } from '../../config/supabaseClient';
import { AppError } from '../../lib/utils/appError';
import { eachDayOfInterval, format, parseISO, addMinutes, isWithinInterval } from 'date-fns';

export const calculateProviderAvailability = async (providerId: string, serviceId: string, startDate: string, endDate: string) => {
    
    const { data: weeklySchedules, error: scheduleError } = await supabase
        .from('provider_weekly_schedules')
        .select('*')
        .eq('provider_id', providerId)
        .eq('service_id', serviceId);

    if (scheduleError) {
        throw new AppError(`Error fetching weekly schedule: ${scheduleError.message}`, 500);
    }

    const { data: overrides, error: overrideError } = await supabase
        .from('provider_availability_overrides')
        .select('*')
        .eq('provider_id', providerId)
        .gte('start_time', startDate)
        .lte('end_time', endDate);

    if (overrideError) {
        throw new AppError(`Error fetching overrides: ${overrideError.message}`, 500);
    }

    const { data: serviceData, error: serviceError } = await supabase.from('services').select('duration_minutes').eq('id', serviceId).single();
    if(serviceError || !serviceData){
        throw new AppError('Service not found or duration not set.', 404);
    }
    const slotDuration = serviceData.duration_minutes;

    const availableSlots: { start_time: Date, end_time: Date }[] = [];
    const days = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

    days.forEach(day => {
        const dayOfWeek = format(day, 'EEEE').toLowerCase();
        const schedulesForDay = weeklySchedules?.filter(s => s.day_of_week === dayOfWeek) || [];

        schedulesForDay.forEach(schedule => {
            let slotStart = parseISO(`${format(day, 'yyyy-MM-dd')}T${schedule.start_time}`);
            const scheduleEnd = parseISO(`${format(day, 'yyyy-MM-dd')}T${schedule.end_time}`);

            while(slotStart < scheduleEnd){
                const slotEnd = addMinutes(slotStart, slotDuration);
                if(slotEnd > scheduleEnd) break;
                availableSlots.push({ start_time: new Date(slotStart), end_time: new Date(slotEnd) });
                slotStart = slotEnd;
            }
        });
    });
    
    const additionOverrides = overrides?.filter(o => o.override_type === 'addition') || [];
    additionOverrides.forEach(override => {
         let slotStart = parseISO(override.start_time);
         const overrideEnd = parseISO(override.end_time);
         while(slotStart < overrideEnd){
            const slotEnd = addMinutes(slotStart, slotDuration);
            if(slotEnd > overrideEnd) break;
            availableSlots.push({ start_time: new Date(slotStart), end_time: new Date(slotEnd) });
            slotStart = slotEnd;
        }
    });

    const blockOffOverrides = overrides?.filter(o => o.override_type === 'block_off') || [];
    const finalSlots = availableSlots.filter(slot => {
        return !blockOffOverrides.some(block => {
            const blockInterval = { start: parseISO(block.start_time), end: parseISO(block.end_time) };
            return isWithinInterval(slot.start_time, blockInterval);
        });
    });
    
    // TODO: Filter out existing appointments
    return finalSlots;
};