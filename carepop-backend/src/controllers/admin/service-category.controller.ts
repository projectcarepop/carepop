import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ServiceCategoryAdminService } from '@/services/admin/service-category.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { AppError } from '@/lib/utils/appError';
import { sendSuccess, sendCreated } from '@/utils/responseHandler';
import { listServiceCategoriesQuerySchema } from '@/validation/admin/service-category.validation';

const serviceCategoryService = new ServiceCategoryAdminService();

export const createServiceCategory = asyncHandler(async (req: Request, res: Response) => {
  const newCategory = await serviceCategoryService.create(req.body);
  sendCreated(res, newCategory);
});

export const getServiceCategories = asyncHandler(async (req: Request, res: Response) => {
  const query = await listServiceCategoriesQuerySchema.parseAsync(req.query);
  const result = await serviceCategoryService.findAll(query);
  sendSuccess(res, result);
});

export const getServiceCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await serviceCategoryService.findOne(id);
  if (!category) {
    throw new AppError('Service category not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, category);
});

export const updateServiceCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedCategory = await serviceCategoryService.update(id, req.body);
  if (!updatedCategory) {
    throw new AppError('Service category not found', StatusCodes.NOT_FOUND);
  }
  sendSuccess(res, updatedCategory);
});

export const deleteServiceCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await serviceCategoryService.remove(id);
  res.status(StatusCodes.NO_CONTENT).send();
}); 