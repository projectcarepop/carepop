import { Request, Response } from 'express';
import { userService } from 'services/admin/userService';
import { updateUserSchema } from 'validation/admin/userValidation';
import { commonSchemas } from 'validation/commonSchemas';
import { sendSuccess } from 'utils/responseHandlers';
import { tryCatch } from 'utils/tryCatch';

export const userController = {
  getAllUsers: async (req: Request, res: Response) => {
    const searchQuery = req.query.search as string | undefined;
    const users = await userService.getAll(searchQuery);
    sendSuccess(res, users);
  },

  getUserAppointments: tryCatch(async (req: Request, res: Response) => {
    const userId = commonSchemas.uuid.parse(req.params.userId);
    const searchQuery = req.query.search as string | undefined;
    const appointments = await userService.getAppointmentsForUser(userId, searchQuery);
    sendSuccess(res, appointments);
  }),

  getUserMedicalRecords: tryCatch(async (req: Request, res: Response) => {
    const userId = commonSchemas.uuid.parse(req.params.userId);
    const searchQuery = req.query.search as string | undefined;
    const records = await userService.getMedicalRecordsForUser(userId, searchQuery);
    sendSuccess(res, records);
  }),

  getUserById: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const user = await userService.getById(id);
    sendSuccess(res, user);
  },

  updateUser: async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const userData = updateUserSchema.parse(req.body);
    const updatedUser = await userService.update(id, userData);
    sendSuccess(res, updatedUser);
  },
}; 