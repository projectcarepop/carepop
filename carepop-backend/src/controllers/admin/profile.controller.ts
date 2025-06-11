import { Request, Response } from 'express';
import * as profileService from '@/services/admin/profile.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseHandler';
import { StatusCodes } from 'http-status-codes';

/**
 * Gets all user profiles.
 */
const getAllProfiles = asyncHandler(async (req: Request, res: Response) => {
  const profiles = await profileService.getAllProfiles();
  sendSuccess(res, { message: 'Profiles retrieved successfully.', data: profiles }, StatusCodes.OK);
});

export { getAllProfiles }; 