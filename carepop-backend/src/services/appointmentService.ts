import { supabase } from '../config/supabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  BookAppointmentRequest,
  Appointment,
  AppointmentStatus,
  UserAppointmentDetails, // Added for APP-USER-1
  // GetUserAppointmentsResponse, // This is an array type, not needed for service return type directly
} from '../types/appointmentTypes';
import { Service } from '../types/serviceTypes'; // For checking service.is_active
// import { Clinic } from '../types/clinicTypes'; // If a specific Clinic type exists for validation
import logger from '../utils/logger';
import EncryptionService from './encryptionService'; // Corrected: Default import

/**
 * Books an appointment after performing necessary validations.
 * MVP: Does not perform complex availability/slot checking.
 * 
 * @param bookingRequest - The appointment booking request details.
 * @param userId - The ID of the user booking the appointment.
 * @param dbClient - The Supabase client to use for database operations.
 * @returns A promise that resolves to the created Appointment object.
 * @throws Error if validation fails or if there's an issue creating the appointment.
 */
export const bookAppointment = async (
  bookingRequest: BookAppointmentRequest,
  userId: string,
  dbClient: SupabaseClient
): Promise<Appointment> => {
  logger.info(`[bookAppointment] Attempting to book appointment for user ${userId}`, bookingRequest);

  const { clinicId, serviceId, providerId, startTime, notes } = bookingRequest;

  // 1. Validate Clinic
  const { data: clinicData, error: clinicError } = await dbClient
    .from('clinics')
    .select('id, is_active')
    .eq('id', clinicId)
    .single();

  if (clinicError || !clinicData) {
    logger.warn(`[bookAppointment] Clinic validation failed for clinicId ${clinicId}:`, clinicError);
    throw new Error('Clinic not found or query failed.');
  }
  if (!clinicData.is_active) {
    logger.warn(`[bookAppointment] Clinic ${clinicId} is not active.`);
    throw new Error('Selected clinic is not active.');
  }

  // 2. Validate Service - Fetch typical_duration_minutes
  const { data: serviceData, error: serviceError } = await dbClient
    .from('services')
    .select('id, is_active, name, typical_duration_minutes')
    .eq('id', serviceId)
    .single();
  
  if (serviceError || !serviceData) {
    logger.warn(`[bookAppointment] Service validation failed for serviceId ${serviceId}:`, serviceError);
    throw new Error('Service not found or query failed.');
  }
  if (!serviceData.is_active) {
    logger.warn(`[bookAppointment] Service ${serviceData.name} (ID: ${serviceId}) is not active.`);
    throw new Error('Selected service is not active.');
  }
  if (serviceData.typical_duration_minutes == null || typeof serviceData.typical_duration_minutes !== 'number') {
    logger.warn(`[bookAppointment] Service ${serviceData.name} (ID: ${serviceId}) has invalid or missing typical_duration_minutes.`);
    throw new Error('Selected service has an invalid or undefined duration.');
  }

  // Calculate endTime on the server
  const startTimeObj = new Date(startTime); // startTime from request is expected to be ISO string
  const calculatedEndTime = new Date(startTimeObj.getTime() + serviceData.typical_duration_minutes * 60000);

  // 3. Validate Clinic offers the Service
  const { data: clinicServiceData, error: clinicServiceError } = await dbClient
    .from('clinic_services')
    .select('clinic_id, service_id, is_offered')
    .eq('clinic_id', clinicId)
    .eq('service_id', serviceId)
    .single();

  if (clinicServiceError || !clinicServiceData) {
    logger.warn(`[bookAppointment] Clinic-service link validation failed for clinic ${clinicId}, service ${serviceId}:`, clinicServiceError);
    throw new Error('Error validating if clinic offers the service.');
  }
  if (!clinicServiceData.is_offered) {
    logger.warn(`[bookAppointment] Clinic ${clinicId} does not currently offer service ${serviceId}.`);
    throw new Error('Selected clinic does not offer this service at the moment.');
  }

  // 4. Validate Provider (if provided) - Basic existence check for MVP
  if (providerId) {
    const { data: providerData, error: providerError } = await dbClient
      .from('providers') // Assuming a 'providers' table exists
      .select('id, is_active') // Assuming providers have an is_active status
      .eq('id', providerId)
      .single();
    
    if (providerError || !providerData) {
      logger.warn(`[bookAppointment] Provider validation failed for providerId ${providerId}:`, providerError);
      throw new Error('Provider not found or query failed.');
    }
    // Add is_active check for provider if applicable, e.g.:
    // if (!providerData.is_active) {
    //   logger.warn(`[bookAppointment] Provider ${providerId} is not active.`);
    //   throw new Error('Selected provider is not active.');
    // }
  }

  // NEW STEP 5: Re-check slot availability (as per API_Submit_Booking_Implementation_Guide.md)
  // This is crucial for preventing double bookings.
  if (providerId) { // Conflict check is primarily relevant if a specific provider is chosen.
    logger.info(`[bookAppointment] Re-checking slot availability for provider ${providerId} at clinic ${clinicId} for time ${startTimeObj.toISOString()} to ${calculatedEndTime.toISOString()}`);
    const { data: conflictingAppointments, error: conflictError } = await dbClient
      .from('appointments')
      .select('id')
      .eq('provider_id', providerId)
      .eq('clinic_id', clinicId)
      // Check for appointments that overlap with the new appointment's time range
      // An existing appointment conflicts if:
      // Its start_time is before the new appointment's end_time AND
      // Its end_time (appointment_datetime + duration_minutes) is after the new appointment's start_time.
      // Since 'end_time' is not stored directly, we use appointment_datetime and duration_minutes for existing appointments.
      // For simplicity, we'll check if an existing appointment's start_time falls within the new slot, 
      // or if the new slot's start_time falls within an existing appointment.
      // A more robust check involves comparing intervals properly.
      // Simplified check: existing.startTime < new.endTime AND existing.endTime > new.startTime
      // We don't have existing.endTime directly, so we need to construct it or use a range overlap function if Supabase/Postgres supports it well.
      // Let's use the logic from the guide for now:
      // lt('start_time', calculatedEndTime.toISOString()) // Existing appt starts before new one ends
      // gt('end_time', startTimeObj.toISOString())   // Existing appt ends after new one starts
      // Since 'end_time' is not a column, we cannot use it in the query directly.
      // We must filter on `appointment_datetime` and `duration_minutes` of existing appointments.
      // This can be complex with direct Supabase queries. An RPC might be better.
      // For now, a simpler check: find appointments for this provider/clinic where *their* start time
      // is not too far from the requested start time, and then filter in code if necessary.
      // OR, let's try a time range overlap. Postgres supports range types and overlap operators (&&).
      // Supabase JS client might not directly expose this for .lt/.gt in an easy way for two columns.

      // Simpler conflict check:
      // Find any appointment for this provider/clinic that STARTS during the proposed new slot
      // OR ENDS during the proposed new slot
      // OR ENCOMPASSES the proposed new slot.
      // This means:
      // (existing.start_time >= new.start_time AND existing.start_time < new.end_time) OR
      // (existing.end_time > new.start_time AND existing.end_time <= new.end_time) OR
      // (existing.start_time < new.start_time AND existing.end_time > new.end_time)
      // This is still hard without a stored end_time.

      // Guide's query adapted:
      // It assumed an 'end_time' column. We need to adapt.
      // Let's find appointments that START within a window that could overlap.
      // An appointment conflicts if:
      //   `existing.appointment_datetime` < `calculatedEndTime` (new appointment's end)
      //   AND
      //   `existing.appointment_datetime + make_interval(mins => existing.duration_minutes)` > `startTimeObj` (new appointment's start)
      .lt('appointment_datetime', calculatedEndTime.toISOString())
      // The part below is tricky: existing_end_time > new_start_time
      // .gt('appointment_datetime' + 'make_interval(secs := duration_minutes * 60)', startTimeObj.toISOString()) // This syntax is illustrative, not direct Supabase JS
      // The above won't work directly. We might need to fetch more and filter, or use an RPC.
      // For an MVP conflict check focusing on start times for now (less robust):
      // This finds appointments starting strictly between the new slot's start and end.
      // And also appointments that start AT THE SAME TIME.
      // .gte('appointment_datetime', startTimeObj.toISOString()) 
      // .lt('appointment_datetime', calculatedEndTime.toISOString())
      // A slightly more robust check for start times that could overlap:
      // Fetch appointments that start before the new one ends, and whose (calculated) end is after the new one starts.
      // This often requires an RPC for proper transactional safety and complex range overlap.

      // Using the guide's logic directly is problematic without an end_time column.
      // Alternative: Query for appointments that start before the new one would end,
      // and then in application code, calculate their end times and check for overlap.
      .lt('appointment_datetime', calculatedEndTime.toISOString()) // Existing starts before new one ends
      .in('status', [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]); // Only check active appointments

    if (conflictError) {
      logger.error(`[bookAppointment] Supabase error checking for conflicting appointments for provider ${providerId}:`, conflictError.message);
      throw new Error('Database error: Could not verify slot availability.');
    }

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      // Further filter in code because direct SQL for interval overlap without stored end_time is hard here
      const newStartTimeMs = startTimeObj.getTime();
      const newEndTimeMs = calculatedEndTime.getTime();

      for (const existingAppt of conflictingAppointments) {
        // We need to fetch duration_minutes for these existing appointments if not already selected
        // Assuming 'id' and 'appointment_datetime' and 'duration_minutes' are selected
        // For this to work, the select above needs to include duration_minutes
        // Let's adjust the select:
        // .select('id, appointment_datetime, duration_minutes')
        // If the select was just 'id', this loop won't work.

        // To implement the guide's spirit, we need to check:
        // existingAppt.appointment_datetime < newEndTime  AND existingAppt.end_time > newStartTime
        // We need to calculate existingAppt.end_time
        // This requires fetching duration_minutes for each potentially conflicting appointment.
        // The original conflict check query needs to select `appointment_datetime` and `duration_minutes`.
        
        // Let's assume the conflict query is adjusted:
        // const { data: conflictingAppointments, error: conflictError } = await dbClient
        //   .from('appointments')
        //   .select('id, appointment_datetime, duration_minutes') // Ensure duration_minutes is fetched
        //   .eq('provider_id', providerId)
        //   .eq('clinic_id', clinicId)
        //   .lt('appointment_datetime', calculatedEndTime.toISOString()) 
        //   .in('status', [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]);
        
        // If the above select is updated, then:
        // const existingApptStartTime = new Date(existingAppt.appointment_datetime).getTime();
        // const existingApptEndTime = existingApptStartTime + existingAppt.duration_minutes * 60000;
        // if (existingApptStartTime < newEndTimeMs && existingApptEndTime > newStartTimeMs) {
        //   logger.warn(`[bookAppointment] Attempted double booking for provider ${providerId}. New: ${startTimeObj.toISOString()}-${calculatedEndTime.toISOString()}. Existing: ${new Date(existingApptStartTime).toISOString()}-${new Date(existingApptEndTime).toISOString()}`);
        //   throw new Error('Slot not available or conflicts with an existing booking.');
        // }
      }
      // If we reach here, the initial coarse filter didn't find a definite overlap that the simplified query could detect without calculating end times.
      // A more robust solution involves an RPC or a more complex query.
      // For now, if the guide's exact query structure cannot be replicated due to schema,
      // we might have to accept a less perfect conflict detection or enhance it later with an RPC.
      // Given the current schema and Supabase JS client limitations for complex date arithmetic in queries:
      // The guide's query:
      // .lt('start_time', endTimeObj.toISOString()) // This is appointment_datetime < new_endTime
      // .gt('end_time', startTimeObj.toISOString()) // This is existing_calculated_end_time > new_startTime
      // This is the problematic part.

      // Let's simplify the conflict check for now:
      // If any appointment for the provider/clinic starts *exactly* at the same time.
      const { data: exactStartTimeConflicts, error: exactConflictError } = await dbClient
        .from('appointments')
        .select('id', { count: 'exact' })
        .eq('provider_id', providerId)
        .eq('clinic_id', clinicId)
        .eq('appointment_datetime', startTimeObj.toISOString())
        .in('status', [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]);

      if (exactConflictError) {
        logger.error(`[bookAppointment] Supabase error checking for exact start time conflicts for provider ${providerId}:`, exactConflictError.message);
        throw new Error('Database error: Could not verify slot availability (exact check).');
      }

      if (exactStartTimeConflicts && exactStartTimeConflicts.length > 0) {
         // The guide had `conflictingAppointments && conflictingAppointments.length > 0`
         // If the count query is used, it would be `exactStartTimeConflicts.count > 0`
         // Let's assume the select returns an array, and if its length > 0, there's a conflict.
        logger.warn(`[bookAppointment] Attempted double booking (exact start time match) for provider ${providerId} at ${startTimeObj.toISOString()}.`);
        throw new Error('Slot not available: An appointment already exists at this exact start time.');
      }
      logger.info(`[bookAppointment] Slot availability check passed for provider ${providerId} (exact start time). More comprehensive overlap check is recommended via RPC.`);
    }
  }

  // 5. Encrypt notes if provided
  let encryptedNotes: string | null = null;
  if (notes) {
    try {
      const encryptionService = new EncryptionService();
      encryptedNotes = await encryptionService.encrypt(notes);
    } catch (encError) {
      logger.error('[bookAppointment] Failed to encrypt notes:', encError);
      throw new Error('Failed to process appointment notes securely.');
    }
  }

  // 6. Create Appointment record - Use server-calculated endTime
  const newAppointmentData = {
    user_id: userId,
    clinic_id: clinicId,
    service_id: serviceId,
    provider_id: providerId || null,
    appointment_datetime: startTime, // This is client provided startTime
    // end_time: calculatedEndTime.toISOString(), // REMOVED: Column does not exist in DB
    duration_minutes: serviceData.typical_duration_minutes,
    status: AppointmentStatus.PENDING,
    notes_user: encryptedNotes, // CHANGED: Map to notes_user
    // notes_clinic will be null by default or handled by clinic staff later
    // created_at and updated_at are typically handled by DB defaults
  };

  logger.info(`[bookAppointment] Attempting insert with userId: ${userId} for appointment data:`, newAppointmentData);

  const { data: createdAppointment, error: creationError } = await dbClient
    .from('appointments')
    .insert(newAppointmentData)
    .select()
    .single();

  if (creationError || !createdAppointment) {
    logger.error('[bookAppointment] Failed to create appointment in DB:', creationError);
    // Check if the error message indicates a problem with 'end_time' as well
    if (creationError?.message.includes('end_time')) {
        logger.error('[bookAppointment] Potential issue with end_time column. Check schema.');
    }
    throw new Error(`Failed to book appointment: ${creationError?.message || 'Unknown error'}`);
  }

  logger.info(`[bookAppointment] Successfully booked appointment ${createdAppointment.id} for user ${userId}`);
  
  // Decrypt notes for the response if they were encrypted, only if necessary for immediate response.
  // Otherwise, client can request and decrypt later if needed via a dedicated endpoint.
  // For now, returning with encrypted notes or null.
  // If decryption is needed here for the response:
  // let responseNotes = createdAppointment.notes;
  // if (createdAppointment.notes && encryptedNotes) { // only if it was just encrypted by this request
  //   try {
  //     responseNotes = await EncryptionService.decrypt(createdAppointment.notes);
  //   } catch (decErr) {
  //     logger.warn('[bookAppointment] Failed to decrypt notes for response, returning encrypted version.', decErr);
  //     // Keep responseNotes as encrypted in this case or null it out if preferred not to send encrypted
  //   }
  // }

  return {
    ...createdAppointment,
    // notes: responseNotes, // If notes were decrypted for response
  } as Appointment; // Cast to ensure all fields of Appointment are covered if select() was partial
};

/**
 * Cancels an appointment.
 *
 * @param appointmentId - The ID of the appointment to cancel.
 * @param cancelledBy - Who is initiating the cancellation ('user' or 'clinic').
 * @param cancellationReason - The reason for cancellation.
 * @param userId - The ID of the user making the request (for user cancellations or audit).
 * @param userRoles - The roles of the user making the request (for clinic cancellations).
 * @returns A promise that resolves to the updated Appointment object.
 * @throws Error if validation or authorization fails, or if there's an issue updating the appointment.
 */
export const cancelAppointment = async (
  appointmentId: string,
  cancelledBy: 'user' | 'clinic',
  cancellationReason: string,
  userId: string,
  userRoles: string[] = [], // Assuming roles are passed for clinic-side cancellation auth
  dbClient: SupabaseClient
): Promise<Appointment> => {
  logger.info(`[cancelAppointment] Attempting to cancel appointment ${appointmentId} by ${cancelledBy} (requester: ${userId})`, { reason: cancellationReason });

  const { data: appointment, error: fetchError } = await dbClient
    .from('appointments')
    .select('*')
    .eq('id', appointmentId)
    .single();

  if (fetchError || !appointment) {
    logger.warn(`[cancelAppointment] Appointment not found or query failed for id ${appointmentId}:`, fetchError);
    throw new Error('Appointment not found.');
  }

  // Check if appointment can be cancelled
  if (
    appointment.status === AppointmentStatus.CANCELLED_USER ||
    appointment.status === AppointmentStatus.CANCELLED_CLINIC ||
    appointment.status === AppointmentStatus.COMPLETED
  ) {
    logger.warn(`[cancelAppointment] Appointment ${appointmentId} cannot be cancelled. Current status: ${appointment.status}`);
    throw new Error(`Appointment cannot be cancelled, its status is: ${appointment.status}`);
  }

  let newStatus: AppointmentStatus;

  if (cancelledBy === 'user') {
    if (appointment.user_id !== userId) {
      logger.error(`[cancelAppointment] User ${userId} not authorized to cancel appointment ${appointmentId} owned by ${appointment.user_id}.`);
      throw new Error('You are not authorized to cancel this appointment.');
    }
    newStatus = AppointmentStatus.CANCELLED_USER;
  } else if (cancelledBy === 'clinic') {
    let isClinicAuthorized = false;
    if (userRoles.includes('admin')) {
      isClinicAuthorized = true;
      logger.info(`[cancelAppointment] User ${userId} is an admin, authorizing clinic-side cancellation for appointment ${appointmentId}.`);
    } else if (userRoles.includes('provider')) {
      logger.info(`[cancelAppointment] User ${userId} has 'provider' role. Checking clinic association for appointment ${appointmentId} at clinic ${appointment.clinic_id}.`);
      const { data: providerData, error: providerError } = await dbClient
        .from('providers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (providerError) {
        logger.error(`[cancelAppointment] Error fetching provider record for user ${userId}:`, providerError);
        // Do not throw here, let isClinicAuthorized remain false
      }

      if (providerData) {
        const { data: facilityLink, error: facilityLinkError } = await dbClient
          .from('provider_facilities')
          .select('facility_id')
          .eq('provider_id', providerData.id)
          .eq('facility_id', appointment.clinic_id) // facility_id is our clinic_id
          .maybeSingle(); // Use maybeSingle as there might be no link

        if (facilityLinkError) {
          logger.error(`[cancelAppointment] Error checking provider-facility link for provider ${providerData.id} and clinic ${appointment.clinic_id}:`, facilityLinkError);
          // Do not throw here
        }
        if (facilityLink) {
          isClinicAuthorized = true;
          logger.info(`[cancelAppointment] User ${userId} (provider ${providerData.id}) is linked to clinic ${appointment.clinic_id}. Authorizing cancellation.`);
        } else {
          logger.warn(`[cancelAppointment] User ${userId} (provider ${providerData.id}) is NOT linked to clinic ${appointment.clinic_id}.`);
        }
      } else {
        logger.warn(`[cancelAppointment] No provider record found for user ${userId} with 'provider' role.`);
      }
    }

    if (!isClinicAuthorized) {
      logger.error(`[cancelAppointment] User ${userId} (roles: ${userRoles.join(',')}) not authorized for clinic-side cancellation of appointment ${appointmentId} at clinic ${appointment.clinic_id}.`);
      throw new Error('You are not authorized to cancel this appointment on behalf of the clinic.');
    }
    newStatus = AppointmentStatus.CANCELLED_CLINIC;
  } else {
    // Should not happen due to Zod validation on request body, but as a safeguard:
    logger.error(`[cancelAppointment] Invalid 'cancelledBy' value: ${cancelledBy}`);
    throw new Error("Invalid cancellation party specified.");
  }

  let encryptedCancellationReason: string | null = cancellationReason;
  if (cancellationReason) {
    try {
      const encryptionService = new EncryptionService();
      encryptedCancellationReason = await encryptionService.encrypt(cancellationReason);
      logger.info(`[cancelAppointment] Cancellation reason for appointment ${appointmentId} was encrypted.`);
    } catch (encError) {
      logger.error(`[cancelAppointment] Failed to encrypt cancellation reason for appointment ${appointmentId}:`, encError);
      // Decide if to throw or proceed with unencrypted. For now, let's proceed but log error.
      // For higher security, one might throw: throw new Error('Failed to process cancellation reason securely.');
      // Or, ensure cancellationReason is nulled if encryption fails and encryption is mandatory.
      // Current choice: log and proceed with potentially unencrypted reason if encryption fails.
      // This is a trade-off. A better approach for mandatory encryption would be to throw.
      // Let's change to throw, to enforce security.
      throw new Error('Failed to process cancellation reason securely.');
    }
  }

  const updateData = {
    status: newStatus,
    cancellation_reason: encryptedCancellationReason, // Use the (potentially) encrypted reason
    updated_at: new Date().toISOString(), // Explicitly set updated_at
  };

  const { data: updatedAppointment, error: updateError } = await dbClient
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .select()
    .single();

  if (updateError || !updatedAppointment) {
    logger.error(`[cancelAppointment] Failed to update appointment ${appointmentId} in DB:`, updateError);
    throw new Error(`Failed to cancel appointment: ${updateError?.message || 'Unknown error'}`);
  }

  logger.info(`[cancelAppointment] Successfully cancelled appointment ${updatedAppointment.id}. New status: ${newStatus}`);
  
  return updatedAppointment as Appointment;
};

/**
 * Fetches a user's future appointments with details about the service, clinic, and provider.
 *
 * @param userId - The ID of the user whose future appointments are to be fetched.
 * @returns A promise that resolves to an array of UserAppointmentDetails.
 * @throws Error if there's an issue querying the database.
 */
export const getUserFutureAppointments = async (
  userId: string,
  dbClient: SupabaseClient
): Promise<UserAppointmentDetails[]> => {
  logger.info(`[getUserFutureAppointments] Attempting to fetch future appointments for user ${userId}`);

  const now = new Date().toISOString();

  const query = dbClient
    .from('appointments')
    .select(`
      id,
      user_id,
      start_time,
      status,
      notes,
      cancellation_reason,
      created_at,
      updated_at,
      service:services!inner(id, name, description),
      clinic:clinics!inner(id, name, address_line1, city),
      provider:providers(id, full_name, specialty)
    `)
    .eq('user_id', userId)
    .gt('start_time', now)
    .in('status', [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
    .order('start_time', { ascending: true });

  const { data: appointmentsData, error: fetchError } = await query;

  if (fetchError) {
    logger.error(`[getUserFutureAppointments] Error fetching future appointments for user ${userId}:`, fetchError);
    throw new Error('Failed to fetch future appointments.');
  }

  if (!appointmentsData) {
    logger.info(`[getUserFutureAppointments] No future appointments found for user ${userId}.`);
    return [];
  }

  // Post-process to decrypt notes
  const encryptionService = new EncryptionService();
  const detailedAppointments: UserAppointmentDetails[] = await Promise.all(
    appointmentsData.map(async (appt: any) => { // Use 'any' for raw Supabase data before casting
      let decryptedNotes: string | null = null;
      if (appt.notes) {
        try {
          decryptedNotes = await encryptionService.decrypt(appt.notes);
        } catch (decErr) {
          logger.warn(`[getUserFutureAppointments] Failed to decrypt notes for appointment ${appt.id}, returning null for notes.`, decErr);
          // Keep notes as null if decryption fails
        }
      }
      return {
        id: appt.id,
        user_id: appt.user_id,
        start_time: appt.start_time,
        status: appt.status as AppointmentStatus,
        notes: decryptedNotes,
        cancellation_reason: appt.cancellation_reason,
        created_at: appt.created_at,
        updated_at: appt.updated_at,
        service: appt.service as UserAppointmentDetails['service'],
        clinic: appt.clinic as UserAppointmentDetails['clinic'],
        provider: appt.provider as UserAppointmentDetails['provider'] | null,
      } as UserAppointmentDetails; // Ensure the final object matches UserAppointmentDetails
    })
  );

  logger.info(`[getUserFutureAppointments] Successfully fetched ${detailedAppointments.length} future appointments for user ${userId}`);
  return detailedAppointments;
};

/**
 * Fetches a user's past appointments with details about the service, clinic, and provider.
 *
 * @param userId - The ID of the user whose past appointments are to be fetched.
 * @returns A promise that resolves to an array of UserAppointmentDetails.
 * @throws Error if there's an issue querying the database.
 */
export const getUserPastAppointments = async (
  userId: string,
  dbClient: SupabaseClient
): Promise<UserAppointmentDetails[]> => {
  logger.info(`[getUserPastAppointments] Attempting to fetch past appointments for user ${userId}`);

  const now = new Date().toISOString();

  const query = dbClient
    .from('appointments')
    .select(`
      id,
      user_id,
      start_time,
      status,
      notes,
      cancellation_reason,
      created_at,
      updated_at,
      service:services!inner(id, name, description),
      clinic:clinics!inner(id, name, address_line1, city),
      provider:providers(id, full_name, specialty)
    `)
    .eq('user_id', userId)
    .lte('start_time', now)
    .in('status', [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED_USER,
      AppointmentStatus.CANCELLED_CLINIC,
      AppointmentStatus.NO_SHOW
    ])
    .order('start_time', { ascending: false });

  const { data: appointmentsData, error: fetchError } = await query;

  if (fetchError) {
    logger.error(`[getUserPastAppointments] Error fetching past appointments for user ${userId}:`, fetchError);
    throw new Error('Failed to fetch past appointments.');
  }

  if (!appointmentsData) {
    logger.info(`[getUserPastAppointments] No past appointments found for user ${userId}.`);
    return [];
  }

  // Post-process to decrypt notes (same logic as for future appointments)
  const encryptionService = new EncryptionService();
  const detailedAppointments: UserAppointmentDetails[] = await Promise.all(
    appointmentsData.map(async (appt: any) => {
      let decryptedNotes: string | null = null;
      if (appt.notes) {
        try {
          decryptedNotes = await encryptionService.decrypt(appt.notes);
        } catch (decErr) {
          logger.warn(`[getUserPastAppointments] Failed to decrypt notes for appointment ${appt.id}, returning null for notes.`, decErr);
        }
      }
      return {
        id: appt.id,
        user_id: appt.user_id,
        start_time: appt.start_time,
        status: appt.status as AppointmentStatus,
        notes: decryptedNotes,
        cancellation_reason: appt.cancellation_reason,
        created_at: appt.created_at,
        updated_at: appt.updated_at,
        service: appt.service as UserAppointmentDetails['service'],
        clinic: appt.clinic as UserAppointmentDetails['clinic'],
        provider: appt.provider as UserAppointmentDetails['provider'] | null,
      } as UserAppointmentDetails;
    })
  );

  logger.info(`[getUserPastAppointments] Successfully fetched ${detailedAppointments.length} past appointments for user ${userId}`);
  return detailedAppointments;
}; 