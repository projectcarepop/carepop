import { Request, Response, NextFunction } from 'express';
import { AdminDashboardService } from '../../services/admin/dashboard.admin.service';

export class AdminDashboardController {
  private dashboardService: AdminDashboardService;

  constructor(dashboardService: AdminDashboardService) {
    this.dashboardService = dashboardService;
    this.getStats = this.getStats.bind(this);
    this.grantAdmin = this.grantAdmin.bind(this);
  }

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.status(200).json({
        success: true,
        message: 'Dashboard statistics retrieved successfully.',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async grantAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID is required.' });
      }

      const result = await this.dashboardService.grantAdminRole(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
} 