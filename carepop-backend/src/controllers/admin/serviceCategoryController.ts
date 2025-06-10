import { Request, Response } from 'express';
import { serviceCategoryService } from 'services/admin/serviceCategoryService';
import { serviceCategorySchemas } from 'validation/admin/serviceCategorySchemas';
import { commonSchemas } from 'validation/commonSchemas';
import { tryCatch } from 'utils/tryCatch';
import { sendCreated, sendSuccess, sendNoContent } from 'utils/responseHandlers';

export const serviceCategoryController = {
  createCategory: tryCatch(async (req: Request, res: Response) => {
    const categoryData = serviceCategorySchemas.create.parse(req.body);
    const newCategory = await serviceCategoryService.create(categoryData);
    sendCreated(res, newCategory);
  }),

  getAllCategories: tryCatch(async (req: Request, res: Response) => {
    const searchQuery = req.query.search as string | undefined;
    const categories = await serviceCategoryService.getAll(searchQuery);
    sendSuccess(res, categories);
  }),

  getCategoryById: tryCatch(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const category = await serviceCategoryService.getById(id);
    sendSuccess(res, category);
  }),

  updateCategory: tryCatch(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const categoryData = serviceCategorySchemas.update.parse(req.body);
    const updatedCategory = await serviceCategoryService.update(id, categoryData);
    sendSuccess(res, updatedCategory);
  }),

  deleteCategory: tryCatch(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    await serviceCategoryService.delete(id);
    sendNoContent(res);
  }),
}; 