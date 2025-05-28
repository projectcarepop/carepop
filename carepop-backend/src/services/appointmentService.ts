import { supabase } from '../config/supabaseClient';
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
 * @returns A promise that resolves to the created Appointment object.
 * @throws Error if validation fails or if there's an issue creating the appointment.
 */
export const bookAppointment = async (
  bookingRequest: BookAppointmentRequest,
  userId: string
): Promise<Appointment> => {
  logger.info(`[bookAppointment] Attempting to book appointment for user ${userId}`, bookingRequest);

  const { clinicId, serviceId, providerId, startTime, endTime, notes } = bookingRequest;

  // 1. Validate Clinic
  const { data: clinicData, error: clinicError } = await supabase
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

  // 2. Validate Service
  const { data: serviceData, error: serviceError } = await supabase
    .from('services')
    .select('id, is_active, name') // name for logging
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

  // 3. Validate Clinic offers the Service
  const { data: clinicServiceData, error: clinicServiceError } = await supabase
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
    const { data: providerData, error: providerError } = await supabase
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

  // 5. Encrypt notes if provided
  let encryptedNotes: string | null = null;
  if (notes) {
    try {
      // EncryptionService is a class, so we need to instantiate it to use its methods.
      // Or, if its methods are static, we call them directly on the class.
      // Based on the provided encryptionService.ts, it's a class that should be instantiated.
      // However, typical service patterns might offer a singleton instance or static methods.
      // For now, assuming it needs instantiation or that methods are static.
      // Let's assume the methods encrypt/decrypt are static for simplicity as per memorylog entries for SEC-E-2.
      // If they are instance methods, an instance would need to be created/retrieved.
      // Re-checking systemPatterns.md for SEC-E-2 for usage patterns if available.
      // systemPatterns.md implies instance usage: `encryptionService.encrypt(data)`
      // So, we need an instance.
      const encryptionService = new EncryptionService();
      encryptedNotes = await encryptionService.encrypt(notes);
    } catch (encError) {
      logger.error('[bookAppointment] Failed to encrypt notes:', encError);
      throw new Error('Failed to process appointment notes securely.');
    }
  }

  // 6. Create Appointment record
  // For MVP, status is 'pending'. No complex availability check.
  const newAppointmentData = {
    user_id: userId,
    clinic_id: clinicId,
    service_id: serviceId,
    provider_id: providerId || null,
    start_time: startTime,
    end_time: endTime,
    status: AppointmentStatus.PENDING,
    notes: encryptedNotes,
    // created_at and updated_at will be set by DB
  };

  const { data: createdAppointment, error: creationError } = await supabase
    .from('appointments')
    .insert(newAppointmentData)
    .select()
    .single();

  if (creationError || !createdAppointment) {
    logger.error('[bookAppointment] Failed to create appointment in DB:', creationError);
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
  userRoles: string[] = [] // Assuming roles are passed for clinic-side cancellation auth
): Promise<Appointment> => {
  logger.info(`[cancelAppointment] Attempting to cancel appointment ${appointmentId} by ${cancelledBy} (requester: ${userId})`, { reason: cancellationReason });

  const { data: appointment, error: fetchError } = await supabase
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
      const { data: providerData, error: providerError } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (providerError) {
        logger.error(`[cancelAppointment] Error fetching provider record for user ${userId}:`, providerError);
        // Do not throw here, let isClinicAuthorized remain false
      }

      if (providerData) {
        const { data: facilityLink, error: facilityLinkError } = await supabase
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

  const { data: updatedAppointment, error: updateError } = await supabase
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
  userId: string
): Promise<UserAppointmentDetails[]> => {
  logger.info(`[getUserFutureAppointments] Attempting to fetch future appointments for user ${userId}`);

  const now = new Date().toISOString();

  const query = supabase
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
  userId: string
): Promise<UserAppointmentDetails[]> => {
  logger.info(`[getUserPastAppointments] Attempting to fetch past appointments for user ${userId}`);

  const now = new Date().toISOString();

  const query = supabase
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