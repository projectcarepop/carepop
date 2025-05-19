import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // For req.user type
import * as profileService from '../services/profileService';
import { UpdateProfileDto } from '../types/profileTypes';
import { z } from 'zod'; // Import Zod

// Define Zod schema for UpdateProfileDto
const baseUpdateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name cannot be empty if provided.").optional().nullable(),
  middleInitial: z.string().trim().max(1, "Middle initial should be a single letter if provided.").optional().nullable(),
  lastName: z.string().trim().min(1, "Last name cannot be empty if provided.").optional().nullable(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format if provided.").optional().nullable(),
  civilStatus: z.string().optional().nullable(),
  religion: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  street: z.string().trim().min(1, "Street address cannot be empty if provided.").optional().nullable(),
  provinceCode: z.string().optional().nullable(),
  cityMunicipalityCode: z.string().optional().nullable(),
  barangayCode: z.string().optional().nullable(),
  contactNo: z.string().trim().regex(/^09\d{9}$/, "Contact number must be a valid 11-digit PH mobile number starting with 09 if provided.").optional().nullable(),
  philhealthNo: z.string().trim()
    // .regex(/^\\d{2}-\\d{9}-\\d{1}$/, { message: "Invalid PhilHealth format (e.g., 12-345678901-2) if provided." })
    .optional().nullable(),
  genderIdentity: z.string().optional().nullable(),
  pronouns: z.string().optional().nullable(),
  assignedSexAtBirth: z.string().optional().nullable(),
});

// Type for data within refine, before it's fully validated against refinements.
// This uses the base schema to infer the type.
type ParsedUpdateProfileData = z.infer<typeof baseUpdateProfileSchema>;

const updateProfileSchema = baseUpdateProfileSchema
  .refine((data: ParsedUpdateProfileData) => Object.keys(data).length > 0, {
    message: "Request body cannot be empty. At least one field must be provided for update.",
  })
  .refine((data: ParsedUpdateProfileData) => !Object.values(data).every(value => value === null || value === undefined || value === ''), {
    message: "At least one field must have a non-empty value if provided for update."
  });

// Consider adding a validation library like Zod for request body validation
// For now, basic checks are in place.

export const handleUpdateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      // This should ideally be caught by authMiddleware, but as a safeguard:
      res.status(401).json({ message: 'User not authenticated or user ID missing.' });
      return;
    }

    // Validate request body using Zod
    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationResult.error.flatten().fieldErrors 
      });
      return;
    }

    const profileData = validationResult.data as UpdateProfileDto; // Data is now validated
    
    // The Zod schema's .refine already checks for empty body / all empty values.
    // The previous manual check can be removed if Zod handles it sufficiently.
    // if (Object.keys(profileData).length === 0 || 
    //     Object.values(profileData).every(value => value === null || value === undefined || value === '')) {
    //   res.status(400).json({ message: 'Request body cannot be empty or contain only empty values for update.' });
    //   return;
    // }
    
    console.log(`[ProfileController] Received update request for user ${userId} with data:`, JSON.stringify(profileData, null, 2));

    const updatedProfile = await profileService.updateUserProfileService(userId, profileData);
    
    if (!updatedProfile) {
      // This could happen if service.updateUserProfile returns null (e.g., profile not found after update attempt)
      res.status(404).json({ message: 'Profile not found or update failed to return data.' });
      return;
    }
    
    res.status(200).json({
      message: 'Profile updated successfully',
      data: updatedProfile
    });
    return; // Explicitly return to match Promise<void>

  } catch (error: any) {
    console.error('[ProfileController] Error in handleUpdateUserProfile:', error.message, error.stack);
    
    // Handle specific errors thrown by the service, e.g., validation or DB errors
    if (error.message === 'No fields provided for profile update.') {
        res.status(400).json({ message: error.message });
        return;
    }
    if (error.message && error.message.startsWith('Database error:')) {
        // Potentially parse code from error.message if needed, e.g., for unique constraint violation
        // Example: if (error.code === '23505') return res.status(409)... etc.
        res.status(500).json({ message: 'A database error occurred while updating the profile.', details: error.message });
        return;
    }
    if (error.message === 'User ID is required to update profile.') { // Should be caught earlier by middleware
        res.status(401).json({ message: error.message });
        return;
    }

    res.status(500).json({ message: 'An unexpected server error occurred while updating the profile.', details: error.message });
    return;
  }
};

export const handleGetUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User not authenticated or user ID missing.' });
      return;
    }

    console.log(`[ProfileController] Received GET profile request for user ${userId}`);

    const userProfile = await profileService.getUserProfileService(userId);

    if (!userProfile) {
      res.status(404).json({ message: 'Profile not found.' }); // Send a JSON 404
      return;
    }

    // Send the decrypted profile back
    // The client-side getUserProfile expects the profile object directly
    res.status(200).json(userProfile); 
    return;

  } catch (error: any) {
    console.error('[ProfileController] Error in handleGetUserProfile:', error.message, error.stack);
    // It's good to ensure even error responses are JSON for consistency if the client expects JSON
    if (error.message && error.message.startsWith('Database error:')) {
        res.status(500).json({ message: 'A database error occurred while fetching the profile.', details: error.message });
        return;
    }
    res.status(500).json({ message: 'An unexpected server error occurred while fetching the profile.', details: error.message });
    return;
  }
}; 