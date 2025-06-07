import { Request, Response, NextFunction } from 'express';
import { ProfileAdminService } from '../../services/admin/profile.admin.service';

export class ProfileAdminController {
  constructor(private profileAdminService: ProfileAdminService) {
    this.getAllProfiles = this.getAllProfiles.bind(this);
  }

  async getAllProfiles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profiles = await this.profileAdminService.getAllProfiles();
      res.status(200).json({
        message: 'Profiles retrieved successfully.',
        data: profiles,
      });
    } catch (error) {
      next(error);
    }
  }
} 