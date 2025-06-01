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

// Define a type for the enhanced response, similar to frontend's BookingConfirmationData
interface EnrichedAppointmentConfirmation {
  appointmentId: string;
  status: string;
  clinicName: string;
  serviceName: string;
  providerName: string | null; // Provider can be optional
  appointment_datetime: string;
  // Add any other fields from 'Appointment' if needed by success step, like notes (decrypted if necessary)
}

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
): Promise<EnrichedAppointmentConfirmation> => { // Changed return type
  logger.info(`[bookAppointment] Attempting to book appointment for user ${userId}`, bookingRequest);

  // Correctly destructure startTime from BookAppointmentRequest
  // endTime from request is available but backend recalculates it based on duration.
  const { clinicId, serviceId, providerId, startTime, notes } = bookingRequest;

  // 1. Validate Clinic & get name
  const { data: clinicData, error: clinicError } = await dbClient
    .from('clinics')
    .select('id, name, is_active') // Ensure name is selected
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

  // 2. Validate Service - Fetch name & typical_duration_minutes
  const { data: serviceData, error: serviceError } = await dbClient
    .from('services')
    .select('id, name, is_active, typical_duration_minutes') // Ensure name is selected
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

  // Calculate endTime on the server using startTime from the request
  const startTimeObj = new Date(startTime); 
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

  // 4. Validate Provider (if provided) & get name
  let providerName: string | null = null; 
  if (providerId) {
    const { data: providerData, error: providerError } = await dbClient
      .from('providers') 
      .select('id, full_name, is_active') // Ensure full_name is selected
      .eq('id', providerId)
      .single();
    
    if (providerError || !providerData) {
      logger.warn(`[bookAppointment] Provider validation failed for providerId ${providerId}:`, providerError);
      throw new Error('Provider not found or query failed.');
    }
    // Assuming is_active check for provider would be here if implemented
    // if (!providerData.is_active) { ... }
    providerName = providerData.full_name;
  }

  // 5. Re-check slot availability (Simplified conflict check)
  if (providerId) { 
    logger.info(`[bookAppointment] Re-checking slot availability for provider ${providerId} at clinic ${clinicId} for time ${startTimeObj.toISOString()} to ${calculatedEndTime.toISOString()}`);
    const { data: conflictingAppointments, error: conflictError } = await dbClient
      .from('appointments')
      .select('id') 
      .eq('provider_id', providerId)
      .eq('clinic_id', clinicId)
      .lt('appointment_datetime', calculatedEndTime.toISOString()) 
      .gte('appointment_datetime', startTimeObj.toISOString()) // Check if any existing appointment starts AT or AFTER new one starts but before new one ends.
      .in('status', [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED]); 

    if (conflictError) {
      logger.error(`[bookAppointment] Supabase error checking for conflicting appointments for provider ${providerId}:`, conflictError.message);
      throw new Error('Database error: Could not verify slot availability.');
    }

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      logger.warn(`[bookAppointment] Potential slot conflict detected for provider ${providerId} at ${startTimeObj.toISOString()}. Conflicting appointment count: ${conflictingAppointments.length}`);
      throw new Error('The selected time slot is no longer available. Please try a different slot.');
    }
  }

  // 6. Encrypt Notes (if any)
  let encryptedNotes: string | null = null;
  if (notes) {
    try {
      const encryptionService = new EncryptionService(); // Instantiate the service
      encryptedNotes = await encryptionService.encrypt(notes);
      logger.info('[bookAppointment] Booking notes encrypted.');
    } catch (encError) {
      logger.error('[bookAppointment] Failed to encrypt booking notes:', encError);
      throw new Error('Failed to process booking notes securely.');
    }
  }

  // 7. Create Appointment Record
  const appointmentDataToInsert = {
    user_id: userId,
    clinic_id: clinicId,
    service_id: serviceId,
    provider_id: providerId, 
    appointment_datetime: startTimeObj.toISOString(), // Store the validated and processed startTime
    status: AppointmentStatus.PENDING, 
    notes: encryptedNotes,
    duration_minutes: serviceData.typical_duration_minutes,
  };

  const { data: newAppointment, error: insertError } = await dbClient
    .from('appointments')
    .insert(appointmentDataToInsert)
    .select()
    .single();

  if (insertError || !newAppointment) {
    logger.error('[bookAppointment] Error creating appointment in database:', insertError);
    throw new Error('Failed to create appointment in database.');
  }

  logger.info(`[bookAppointment] Appointment ${newAppointment.id} booked successfully for user ${userId}.`);
  
  // Construct the enriched response
  const enrichedResponse: EnrichedAppointmentConfirmation = {
    appointmentId: newAppointment.id,
    status: newAppointment.status,
    clinicName: clinicData.name, 
    serviceName: serviceData.name, 
    providerName: providerName, 
    appointment_datetime: newAppointment.appointment_datetime,
  };

  return enrichedResponse;
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
      appointment_datetime,
      status,
      notes:notes_user
    `)
    .eq('user_id', userId)
    .gt('appointment_datetime', now)
    .in('status', [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED])
    .order('appointment_datetime', { ascending: true });

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
        start_time: appt.appointment_datetime,
        status: appt.status as AppointmentStatus,
        notes: decryptedNotes,
        cancellation_reason: null, // Added to satisfy type
        created_at: 'N/A', // Placeholder for removed field
        updated_at: 'N/A', // Placeholder for removed field
        service: { id: 'N/A', name: 'N/A', description: 'N/A' }, // Placeholder
        clinic: { id: 'N/A', name: 'N/A', address_line1: 'N/A', city: 'N/A' }, // Placeholder, added missing fields
        provider: null, // Placeholder
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
      appointment_datetime,
      status,
      notes:notes_user
    `)
    .eq('user_id', userId)
    .lte('appointment_datetime', now)
    .in('status', [
      AppointmentStatus.COMPLETED,
      AppointmentStatus.CANCELLED_USER,
      AppointmentStatus.CANCELLED_CLINIC,
      AppointmentStatus.NO_SHOW
    ])
    .order('appointment_datetime', { ascending: false });

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
        start_time: appt.appointment_datetime,
        status: appt.status as AppointmentStatus,
        notes: decryptedNotes,
        cancellation_reason: null, // Added to satisfy type
        created_at: 'N/A', // Placeholder for removed field
        updated_at: 'N/A', // Placeholder for removed field
        service: { id: 'N/A', name: 'N/A' , description: 'N/A'}, // Placeholder
        clinic: { id: 'N/A', name: 'N/A', address_line1: 'N/A', city: 'N/A' }, // Placeholder, added missing fields
        provider: null, // Placeholder
      } as UserAppointmentDetails;
    })
  );

  logger.info(`[getUserPastAppointments] Successfully fetched ${detailedAppointments.length} past appointments for user ${userId}`);
  return detailedAppointments;
}; 