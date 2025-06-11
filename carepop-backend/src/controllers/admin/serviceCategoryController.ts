import { Request, Response } from 'express';
import { serviceCategoryService } from '@/services/admin/serviceCategoryService';
import { createServiceCategorySchema, updateServiceCategorySchema } from '@/validation/admin/service-category.admin.validation';
import { commonSchemas } from '@/validation/commonSchemas';
import { asyncHandler } from '@/utils/asyncHandler';
import { sendCreated, sendSuccess, sendNoContent } from '@/utils/responseHandler';

export const serviceCategoryController = {
  createCategory: asyncHandler(async (req: Request, res: Response) => {
    const newCategory = await serviceCategoryService.create(createServiceCategorySchema.parse(req.body));
    sendCreated(res, newCategory);
  }),

  getAllCategories: asyncHandler(async (req: Request, res: Response) => {
    const categories = await serviceCategoryService.getAll();
    sendSuccess(res, categories);
  }),

  getCategoryById: asyncHandler(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const category = await serviceCategoryService.getById(id);
    sendSuccess(res, category);
  }),

  updateCategory: asyncHandler(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    const updatedCategory = await serviceCategoryService.update(id, updateServiceCategorySchema.parse(req.body));
    sendSuccess(res, updatedCategory);
  }),

  deleteCategory: asyncHandler(async (req: Request, res: Response) => {
    const id = commonSchemas.uuid.parse(req.params.id);
    await serviceCategoryService.delete(id);
    sendNoContent(res);
  }),
}; 