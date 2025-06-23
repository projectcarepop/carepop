import { db } from '../../db/drizzle';
import { clinics, providerAvailability, appointments } from '../../db/schema';
import { ApiError } from '../../lib/errors';
import { eq, and, gte, lt } from 'drizzle-orm';
import {
  startOfDay,
  endOfDay,
  parseISO,
  getDay,
  setHours,
  setMinutes,
  isBefore,
  addMinutes,
  format,
} from 'date-fns';

async function getAllClinics() {
  try {
    const data = await db.query.clinics.findMany({
      where: eq(clinics.isActive, true),
      orderBy: (clinics, { asc }) => [asc(clinics.name)],
    });
    return data;
  } catch (error) {
    console.error('Error fetching clinics for booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve clinics. Database error: ${errorMessage}`);
  }
}

async function getServicesForClinic(clinicId: string) {
  try {
    const data = await db.query.clinicServices.findMany({
      where: (clinicServices, { eq }) => eq(clinicServices.clinicId, clinicId),
      with: {
        service: {
          with: {
            specialization: true,
          },
        },
      },
    });

    // We only want to return the service data, not the join table data.
    return data.map((item) => item.service);
  } catch (error) {
    console.error(`Error fetching services for clinic ${clinicId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve services for clinic. Database error: ${errorMessage}`);
  }
}

async function getProviderAvailability(providerId: string, date: string) {
  try {
    const targetDate = parseISO(date);
    const dayOfWeek = getDay(targetDate); // Sunday = 0, Monday = 1, etc.

    // 1. Get the provider's general availability for that day of the week
    const availability = await db.query.providerAvailability.findFirst({
      where: and(
        eq(providerAvailability.providerId, providerId),
        eq(providerAvailability.dayOfWeek, dayOfWeek)
      ),
    });

    if (!availability) {
      return []; // Provider is not available on this day of the week
    }

    // 2. Get all existing appointments for the provider on the target date
    const startOfTargetDay = startOfDay(targetDate);
    const endOfTargetDay = endOfDay(targetDate);

    const existingAppointments = await db
      .select({
        startTime: appointments.startTime,
        endTime: appointments.endTime,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.providerId, providerId),
          gte(appointments.startTime, startOfTargetDay),
          lt(appointments.startTime, endOfTargetDay)
        )
      );

    const bookedSlots = new Set(
      existingAppointments.map((a) => format(a.startTime, 'HH:mm'))
    );

    // 3. Generate 30-minute slots and filter out booked ones
    const availableSlots = [];
    const [startHour, startMinute] = availability.startTime.split(':').map(Number);
    const [endHour, endMinute] = availability.endTime.split(':').map(Number);

    let currentTime = setMinutes(setHours(startOfTargetDay, startHour), startMinute);
    const endTime = setMinutes(setHours(startOfTargetDay, endHour), endMinute);

    while (isBefore(currentTime, endTime)) {
      const slotTime = format(currentTime, 'HH:mm');
      if (!bookedSlots.has(slotTime)) {
        availableSlots.push(slotTime);
      }
      currentTime = addMinutes(currentTime, 30); // Assuming 30-minute slots
    }

    return availableSlots;
  } catch (error) {
    console.error(`Error fetching availability for provider ${providerId} on ${date}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve availability. Database error: ${errorMessage}`);
  }
}

export const bookingService = {
  getAllClinics,
  getServicesForClinic,
  getProviderAvailability,
}; 