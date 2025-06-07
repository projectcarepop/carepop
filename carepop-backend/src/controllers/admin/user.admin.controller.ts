import { Request, Response, NextFunction } from 'express';
import { UserAdminService } from '../../services/admin/user.admin.service';
import { listUsersQuerySchema, getUserParamsSchema } from '../../validation/admin/user.admin.validation';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

export class UserAdminController {
  constructor(private userAdminService: UserAdminService) {}

  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, search, role } = listUsersQuerySchema.parse(req.query);
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      
      const result = await this.userAdminService.listUsers(pageNum, limitNum, search, role);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = getUserParamsSchema.parse(req.params);
      const result = await this.userAdminService.getUserDetails(userId);
      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { userId } = req.params;
    const userData = req.body;
    const updatedUser = await this.userAdminService.updateUser(userId, userData);
    res.status(StatusCodes.OK).json(updatedUser);
  }
} 