import { Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../../middleware/authMiddleware'; // Assuming you have this for admin routes
import { AdminClinicProviderService } from '../../services/admin/clinicProvider.admin.service';
import {
  clinicIdParamSchema,
  associateProviderBodySchema,
  listProvidersForClinicQuerySchema,
  clinicProviderPathParamsSchema
} from '../../validation/admin/clinicProvider.admin.validation';

export class AdminClinicProviderController {
  private clinicProviderService: AdminClinicProviderService;

  constructor() {
    this.clinicProviderService = new AdminClinicProviderService();
    // Bind methods
    this.associateProvider = this.associateProvider.bind(this);
    this.listProviders = this.listProviders.bind(this);
    this.disassociateProvider = this.disassociateProvider.bind(this);
  }

  async associateProvider(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = clinicIdParamSchema.parse(req.params);
      const { providerId } = associateProviderBodySchema.parse(req.body);

      const result = await this.clinicProviderService.associateProviderWithClinic(clinicId, providerId);

      if (!result.success) {
        // Determine appropriate status code based on message (e.g., 404 if clinic/provider not found, 409 if already associated)
        // For simplicity, using 400 for now if not a clear not found.
        let statusCode = StatusCodes.BAD_REQUEST;
        if (result.message?.includes('not found')) {
          statusCode = StatusCodes.NOT_FOUND;
        }
        if (result.message?.includes('already associated')) {
          statusCode = StatusCodes.CONFLICT;
        }
        res.status(statusCode).json({ message: result.message });
        return;
      }

      res.status(StatusCodes.CREATED).json({ message: result.message });
    } catch (error) {
      next(error);
    }
  }

  async listProviders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId } = clinicIdParamSchema.parse(req.params);
      const queryOptions = listProvidersForClinicQuerySchema.parse(req.query);

      const providers = await this.clinicProviderService.listProvidersForClinic(clinicId, queryOptions);
      const totalItems = await this.clinicProviderService.countProvidersForClinic(clinicId);
      
      const totalPages = Math.ceil(totalItems / queryOptions.limit);

      res.status(StatusCodes.OK).json({
        message: 'Providers retrieved successfully',
        data: providers,
        meta: {
          totalItems,
          totalPages,
          currentPage: queryOptions.page,
          itemsPerPage: queryOptions.limit,
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async disassociateProvider(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { clinicId, providerId } = clinicProviderPathParamsSchema.parse(req.params);

      const result = await this.clinicProviderService.disassociateProviderFromClinic(clinicId, providerId);

      if (!result.success) {
        let statusCode = StatusCodes.BAD_REQUEST;
        if (result.message?.includes('not associated') || result.message?.includes('not found')) {
          statusCode = StatusCodes.NOT_FOUND;
        }
        res.status(statusCode).json({ message: result.message });
        return;
      }

      res.status(StatusCodes.OK).json({ message: result.message }); 
      // Alternatively, use 204 No Content for successful deletions without a body
      // res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }
} 