import { Request, Response, NextFunction } from 'express';
import { getDashboardStats, grantAdminRole } from '../../services/admin/dashboard.admin.service';
import { supabaseServiceRole } from '../../config/supabaseClient';

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // For admin routes, we use the pre-initialized service_role client
    // to ensure necessary permissions for administrative queries.
    const stats = await getDashboardStats(supabaseServiceRole);

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully.',
      data: stats,
    });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};

export const grantAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required.' });
    }

    const result = await grantAdminRole(supabaseServiceRole, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
}; 