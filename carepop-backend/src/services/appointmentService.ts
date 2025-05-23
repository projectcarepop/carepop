import { supabase } from '../config/supabaseClient';
import { BookAppointmentRequest, Appointment, AppointmentStatus } from '../types/appointmentTypes';
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

  const { clinicId, serviceId, providerId, appointment_time, notes } = bookingRequest;

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
    appointment_time: appointment_time,
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