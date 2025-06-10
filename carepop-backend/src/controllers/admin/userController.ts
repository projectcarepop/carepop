import { Request, Response } from 'express';
import { userService } from '@/services/admin/userService';
import { updateUserBodySchema } from '@/validation/admin/user.admin.validation';
import { commonSchemas } from '@/validation/commonSchemas';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseHandler';

export const userController = {
  getUsers: asyncHandler(async (req: Request, res: Response) => {
    const search = req.query.search as string | undefined;
    const users = await userService.getAll(search);
    sendSuccess(res, users);
  }),

  getUser: asyncHandler(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const user = await userService.getById(id);
    sendSuccess(res, user);
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const updatedUser = await userService.update(id, updateUserBodySchema.parse(req.body));
    sendSuccess(res, updatedUser);
  }),
}; 