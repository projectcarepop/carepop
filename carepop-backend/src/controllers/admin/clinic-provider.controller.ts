import { Response } from 'express';
import { AuthenticatedRequest } from '@/types/authenticated-request.interface';
import * as clinicProviderService from '@/services/admin/clinic-provider.service';
import { asyncHandler } from '@/lib/utils/asyncHandler';
import { sendCreated, sendSuccess } from '@/utils/responseHandler';

const associateProvider = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { clinicId } = req.params;
  const { providerId } = req.body;
  const result = await clinicProviderService.associateProviderWithClinic(clinicId, providerId);
  sendCreated(res, result);
});

const listProviders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { clinicId } = req.params;
  
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const queryOptions = { page, limit };

  const providers = await clinicProviderService.listProvidersForClinic(clinicId, queryOptions);
  const totalItems = await clinicProviderService.countProvidersForClinic(clinicId);
  
  const totalPages = Math.ceil(totalItems / limit);

  const meta = {
    totalItems,
    totalPages,
    currentPage: page,
    itemsPerPage: limit,
  };

  sendSuccess(res, { message: 'Providers retrieved successfully', data: providers, meta });
});

const disassociateProvider = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { clinicId, providerId } = req.params;
  const result = await clinicProviderService.disassociateProviderFromClinic(clinicId, providerId);
  sendSuccess(res, result);
});

export { associateProvider, listProviders, disassociateProvider }; 