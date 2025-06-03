import { Request, Response, NextFunction } from 'express';
import { AdminClinicService } from '../../services/admin/clinic.admin.service';
import { 
  createClinicSchema, 
  clinicIdParamSchema, 
  listClinicsQuerySchema,
  updateClinicSchema
} from '../../validation/admin/clinic.admin.validation';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';

export class AdminClinicController {
  private clinicService: AdminClinicService;

  constructor() {
    this.clinicService = new AdminClinicService();
    // Bind methods to ensure 'this' context is correct when they are used as route handlers
    this.createClinic = this.createClinic.bind(this);
    this.listClinics = this.listClinics.bind(this);
    this.getClinicById = this.getClinicById.bind(this);
    this.updateClinic = this.updateClinic.bind(this);
    this.deleteClinic = this.deleteClinic.bind(this);
    // ... bind other methods like getClinicById, listClinics, updateClinic, deleteClinic later
  }

  async createClinic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validate request body
      const validatedBody = createClinicSchema.parse(req.body);
      const creatorUserId = req.user?.id;

      if (!creatorUserId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User ID not found in token.' });
        return;
      }

      // 2. Call the service
      const newClinic = await this.clinicService.createClinic(validatedBody, creatorUserId);

      // 3. Send response
      res.status(StatusCodes.CREATED).json({
        message: 'Clinic created successfully',
        data: newClinic,
      });
    } catch (error) {
      // Pass error to the global error handler middleware
      next(error);
    }
  }

  async listClinics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validate query parameters
      const validatedQuery = listClinicsQuerySchema.parse(req.query);
      const { page, limit, isActive, sortBy, sortOrder, searchByName } = validatedQuery;

      // 2. Prepare options for the service
      const serviceOptions = {
        page,
        limit,
        isActive, // Will be boolean or undefined due to Zod schema
        sortBy,
        sortOrder,
        searchByName, // If implementing search
      };

      // 3. Fetch clinics and total count
      const clinics = await this.clinicService.listClinics(serviceOptions);
      const totalItems = await this.clinicService.countClinics({ isActive, searchByName /* pass other relevant filters */ });
      
      // 4. Calculate pagination metadata
      const totalPages = Math.ceil(totalItems / limit);

      // 5. Send response
      res.status(StatusCodes.OK).json({
        message: 'Clinics retrieved successfully',
        data: clinics,
        meta: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit,
          // Include sortBy and sortOrder to confirm what was applied
          sortBy,
          sortOrder,
          searchByName: searchByName || undefined, // Ensure it's explicitly undefined if not provided, or pass the value
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getClinicById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    console.log(`[AdminClinicController] getClinicById CALLED for ID: ${req.params.clinicId}, Timestamp: ${new Date().toISOString()}`);
    try {
      // 1. Validate clinicId from URL params
      const { clinicId } = clinicIdParamSchema.parse(req.params);
      console.log(`[AdminClinicController] Validated clinicId: ${clinicId}`);

      // 2. Call the service
      console.log(`[AdminClinicController] Calling clinicService.getClinicById for ID: ${clinicId}`);
      const clinic = await this.clinicService.getClinicById(clinicId);
      console.log(`[AdminClinicController] clinicService.getClinicById returned:`, clinic);

      // !!!!! TEMPORARY TEST START !!!!!
      if (clinic) {
        console.log(`[AdminClinicController] TEMP TEST: Clinic found, attempting to send simplified response.`);
        res.status(StatusCodes.OK).json({ message: "Test successful", clinicName: clinic.name, clinicId: clinic.id });
        return; // Exit early after sending test response
      }
      // !!!!! TEMPORARY TEST END !!!!!

      // 3. Handle response
      if (!clinic) {
        console.log(`[AdminClinicController] Clinic with ID ${clinicId} not found. Responding 404.`);
        res.status(StatusCodes.NOT_FOUND).json({ message: `Clinic with ID ${clinicId} not found.` });
        return;
      }

      console.log(`[AdminClinicController] Clinic with ID ${clinicId} found. Responding 200.`);
      res.status(StatusCodes.OK).json({
        message: 'Clinic retrieved successfully',
        data: clinic,
      });
    } catch (error) {
      console.error(`[AdminClinicController] ERROR in getClinicById for ID: ${req.params.clinicId}:`, error);
      // Ensure the error is actually passed to the global error handler
      next(error);
    }
  }

  async updateClinic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validate clinicId from URL params
      const { clinicId } = clinicIdParamSchema.parse(req.params);
      // 2. Validate request body for updates
      const validatedBody = updateClinicSchema.parse(req.body);
      const updatorUserId = req.user?.id;

      if (!updatorUserId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'User ID not found in token.' });
        return;
      }

      // 3. Call the service
      const updatedClinic = await this.clinicService.updateClinic(clinicId, validatedBody, updatorUserId);

      // 4. Handle response
      if (!updatedClinic) {
        res.status(StatusCodes.NOT_FOUND).json({ message: `Clinic with ID ${clinicId} not found or update failed.` });
        return;
      }

      res.status(StatusCodes.OK).json({
        message: `Clinic with ID ${clinicId} updated successfully`,
        data: updatedClinic,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteClinic(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Validate clinicId from URL params
      const { clinicId } = clinicIdParamSchema.parse(req.params);

      // 2. Call the service
      const result = await this.clinicService.deleteClinic(clinicId);

      // 3. Handle response
      if (!result.success) {
        // Service layer already determined if it was a "not found" or other issue (though other issues throw)
        // For a failed delete where service indicates not found:
        res.status(StatusCodes.NOT_FOUND).json({ message: result.message || `Clinic with ID ${clinicId} not found.` });
        return;
      }
      // For successful deletion
      res.status(StatusCodes.OK).json({ message: `Clinic with ID ${clinicId} deleted successfully.` });
      // Alternatively, use 204 No Content if you prefer not to send a body:
      // res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  }

  // Placeholder for other admin clinic methods:
  // async getClinicById(req: Request, res: Response, next: NextFunction): Promise<void> { /* ... */ }
  // async updateClinic(req: Request, res: Response, next: NextFunction): Promise<void> { /* ... */ }
  // async deleteClinic(req: Request, res: Response, next: NextFunction): Promise<void> { /* ... */ }
} 