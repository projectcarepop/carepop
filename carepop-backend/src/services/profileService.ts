import { supabaseServiceRole } from '../config/supabaseClient'; 
import { UpdateProfileDto } from '../types/profileTypes';
import { Profile } from '../types/supabaseDbTypes';
import logger from '../utils/logger';
import EncryptionService from './encryptionService';

const encryptionService = new EncryptionService();

/**
 * Calculates age based on a date of birth string.
 * @param {string} dobString - The date of birth string (e.g., "YYYY-MM-DD").
 * @returns {number | null} The calculated age, or null if DOB is invalid.
 */
const calculateAgeFromString = (dobString: string): number | null => {
  if (!dobString) return null;
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return null; // Invalid date

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

/**
 * Updates a user's profile in the database.
 * @param userId - The ID of the user whose profile is to be updated.
 * @param profileData - An object containing the profile fields to update.
 * @returns The updated profile object or null if the update failed or user not found.
 * @throws Error if userId is not provided or if Supabase encounters an error.
 */
export const updateUserProfileService = async (
  userId: string, 
  profileData: UpdateProfileDto
): Promise<Profile | null> => {
  logger.info(`[ProfileService] updateUserProfileService called for userId: ${userId}`);

  if (!userId) {
    logger.error('[ProfileService] Error: User ID is required to update profile.');
    throw new Error('User ID is required to update profile.');
  }

  const updates: Partial<Profile> = {
    first_name: profileData.firstName,
    middle_initial: profileData.middleInitial,
    last_name: profileData.lastName,
    civil_status: profileData.civilStatus,
    religion: profileData.religion,
    occupation: profileData.occupation,
    province_code: profileData.provinceCode,
    city_municipality_code: profileData.cityMunicipalityCode,
    barangay_code: profileData.barangayCode,
    updated_at: new Date().toISOString(),
    // Sensitive fields will be conditionally added below
  };

  // Handle sensitive fields: encrypt if string, pass null as is, or leave undefined
  if (profileData.dateOfBirth !== undefined) {
    if (typeof profileData.dateOfBirth === 'string') {
      updates.date_of_birth = await encryptionService.encrypt(profileData.dateOfBirth);
      // Calculate age using the original string before it's replaced by encrypted data
      const age = calculateAgeFromString(profileData.dateOfBirth);
      if (age !== null) {
        updates.age = age;
      }
    } else { // null
      updates.date_of_birth = null;
    }
  }

  if (profileData.philhealthNo !== undefined) {
    if (typeof profileData.philhealthNo === 'string') {
      updates.philhealth_no = await encryptionService.encrypt(profileData.philhealthNo);
    } else { // null
      updates.philhealth_no = null;
    }
  }

  if (profileData.contactNo !== undefined) {
    if (typeof profileData.contactNo === 'string') {
      updates.contact_no = await encryptionService.encrypt(profileData.contactNo);
    } else { // null
      updates.contact_no = null;
    }
  }

  if (profileData.street !== undefined) {
    if (typeof profileData.street === 'string') {
      updates.street = await encryptionService.encrypt(profileData.street);
    } else { // null
      updates.street = null;
    }
  }

  if (profileData.genderIdentity !== undefined) {
    if (typeof profileData.genderIdentity === 'string') {
      updates.gender_identity = await encryptionService.encrypt(profileData.genderIdentity);
    } else { // null
      updates.gender_identity = null;
    }
  }

  if (profileData.pronouns !== undefined) {
    if (typeof profileData.pronouns === 'string') {
      updates.pronouns = await encryptionService.encrypt(profileData.pronouns);
    } else { // null
      updates.pronouns = null;
    }
  }

  if (profileData.assignedSexAtBirth !== undefined) { 
    if (typeof profileData.assignedSexAtBirth === 'string') {
      updates.assigned_sex_at_birth = await encryptionService.encrypt(profileData.assignedSexAtBirth);
    } else { // null
      updates.assigned_sex_at_birth = null;
    }
  }

  // Remove undefined properties from non-sensitive fields if DTO didn't provide them
  // (Sensitive fields handled above will be undefined, null, or encrypted string)
  Object.keys(updates).forEach(key => {
    const K = key as keyof typeof updates;
    if (updates[K] === undefined) {
      delete updates[K];
    }
  });
  
  // Ensure there's something to update besides updated_at
  const updateKeys = Object.keys(updates);
  if (updateKeys.length === 0 || (updateKeys.length === 1 && updateKeys[0] === 'updated_at' && Object.keys(profileData).length === 0) ) {
    logger.info('[ProfileService] No actual profile data to update for user:', userId);
    // Optionally, still fetch and return the current profile if no update occurs.
    // For now, we'll consider this a case where no update operation is performed.
    // To return current profile: return await supabase.from('profiles').select('*').eq('user_id', userId).single().then(res => res.data);
    throw new Error('No fields provided for profile update.'); // Or return current profile
  }

  logger.info(`[ProfileService] Attempting to update profile for user ${userId} with data:`, JSON.stringify(updates, null, 2));

  const { data: updatedProfileData, error } = await supabaseServiceRole
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logger.error(`[ProfileService] Supabase error updating profile for user ${userId}:`, JSON.stringify(error, null, 2));
    throw new Error(`Database error: ${error.message} (Code: ${error.code})`); 
  }

  if (!updatedProfileData) {
    logger.warn(`[ProfileService] No profile data returned after update for user ${userId}, profile might not exist or RLS prevented access.`);
    return null; 
  }

  logger.info(`[ProfileService] Profile updated successfully for user ${userId}. Decrypting sensitive fields before returning.`);

  // Decrypt sensitive fields before returning the profile
  const fullyProcessedProfile = { ...updatedProfileData } as Profile;

  if (fullyProcessedProfile.date_of_birth) {
    try {
      fullyProcessedProfile.date_of_birth = await encryptionService.decrypt(fullyProcessedProfile.date_of_birth);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt date_of_birth for user ${userId}:`, decryptionError);
      // Decide how to handle: return as is (encrypted), nullify, or throw? For now, logging and returning as is.
    }
  }
  if (fullyProcessedProfile.philhealth_no) {
    try {
      fullyProcessedProfile.philhealth_no = await encryptionService.decrypt(fullyProcessedProfile.philhealth_no);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt philhealth_no for user ${userId}:`, decryptionError);
    }
  }
  if (fullyProcessedProfile.contact_no) {
    try {
      fullyProcessedProfile.contact_no = await encryptionService.decrypt(fullyProcessedProfile.contact_no);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt contact_no for user ${userId}:`, decryptionError);
    }
  }
  if (fullyProcessedProfile.street) {
    try {
      fullyProcessedProfile.street = await encryptionService.decrypt(fullyProcessedProfile.street);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt street for user ${userId}:`, decryptionError);
    }
  }

  if (fullyProcessedProfile.gender_identity) {
    try {
      fullyProcessedProfile.gender_identity = await encryptionService.decrypt(fullyProcessedProfile.gender_identity);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt gender_identity for user ${userId}:`, decryptionError);
    }
  }

  if (fullyProcessedProfile.pronouns) {
    try {
      fullyProcessedProfile.pronouns = await encryptionService.decrypt(fullyProcessedProfile.pronouns);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt pronouns for user ${userId}:`, decryptionError);
    }
  }

  if (fullyProcessedProfile.assigned_sex_at_birth) { 
    try {
      fullyProcessedProfile.assigned_sex_at_birth = await encryptionService.decrypt(fullyProcessedProfile.assigned_sex_at_birth);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt assigned_sex_at_birth for user ${userId}:`, decryptionError);
    }
  }

  return fullyProcessedProfile;
}; 

/**
 * Fetches a user's profile from the database and decrypts sensitive fields.
 * @param userId - The ID of the user whose profile is to be fetched.
 * @returns The profile object with sensitive fields decrypted, or null if not found.
 * @throws Error if userId is not provided or if Supabase encounters an error.
 */
export const getUserProfileService = async (userId: string): Promise<Profile | null> => {
  logger.info(`[ProfileService] getUserProfileService called for userId: ${userId}`);

  if (!userId) {
    logger.error('[ProfileService] Error: User ID is required to fetch profile.');
    throw new Error('User ID is required to fetch profile.');
  }

  const { data: profileData, error } = await supabaseServiceRole
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PostgREST error code for "Resource not found"
      logger.warn(`[ProfileService] Profile not found for user ${userId}.`);
      return null;
    }
    logger.error(`[ProfileService] Supabase error fetching profile for user ${userId}:`, JSON.stringify(error, null, 2));
    throw new Error(`Database error: ${error.message} (Code: ${error.code})`);
  }

  if (!profileData) {
    logger.warn(`[ProfileService] No profile data returned for user ${userId}, though no explicit error from Supabase.`);
    return null; 
  }

  logger.info(`[ProfileService] Profile fetched successfully for user ${userId}. Decrypting sensitive fields.`);

  // Decrypt sensitive fields before returning the profile
  // Ensure we are working with a mutable copy
  const fullyProcessedProfile = { ...profileData } as Profile;

  if (fullyProcessedProfile.date_of_birth) {
    try {
      fullyProcessedProfile.date_of_birth = await encryptionService.decrypt(fullyProcessedProfile.date_of_birth);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt date_of_birth for user ${userId} during fetch:`, decryptionError);
      // Handle: return as is (encrypted), nullify, or throw? For now, logging and returning as is.
    }
  }
  if (fullyProcessedProfile.philhealth_no) {
    try {
      fullyProcessedProfile.philhealth_no = await encryptionService.decrypt(fullyProcessedProfile.philhealth_no);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt philhealth_no for user ${userId} during fetch:`, decryptionError);
    }
  }
  if (fullyProcessedProfile.contact_no) {
    try {
      fullyProcessedProfile.contact_no = await encryptionService.decrypt(fullyProcessedProfile.contact_no);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt contact_no for user ${userId} during fetch:`, decryptionError);
    }
  }
  if (fullyProcessedProfile.street) {
    try {
      fullyProcessedProfile.street = await encryptionService.decrypt(fullyProcessedProfile.street);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt street for user ${userId} during fetch:`, decryptionError);
    }
  }
  if (fullyProcessedProfile.gender_identity) {
    try {
      fullyProcessedProfile.gender_identity = await encryptionService.decrypt(fullyProcessedProfile.gender_identity);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt gender_identity for user ${userId} during fetch:`, decryptionError);
    }
  }
  if (fullyProcessedProfile.pronouns) {
    try {
      fullyProcessedProfile.pronouns = await encryptionService.decrypt(fullyProcessedProfile.pronouns);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt pronouns for user ${userId} during fetch:`, decryptionError);
    }
  }
  if (fullyProcessedProfile.assigned_sex_at_birth) { 
    try {
      fullyProcessedProfile.assigned_sex_at_birth = await encryptionService.decrypt(fullyProcessedProfile.assigned_sex_at_birth);
    } catch (decryptionError) {
      logger.error(`[ProfileService] Failed to decrypt assigned_sex_at_birth for user ${userId} during fetch:`, decryptionError);
    }
  }

  return fullyProcessedProfile;
}; 