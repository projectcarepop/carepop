import { Router } from 'express';
import * as clinicProviderController from '@/controllers/admin/clinic-provider.controller';
import { validateRequest } from '@/lib/middleware/validate.middleware';
import {
  associateProviderSchema,
  disassociateProviderSchema,
  listProvidersForClinicSchema,
} from '@/validation/admin/clinic-provider.validation';

const router = Router({ mergeParams: true });

/**
 * @openapi
 * /api/v1/admin/clinics/{clinicId}/providers:
 *   get:
 *     tags:
 *       - Admin Clinic Providers
 *     summary: List providers associated with a clinic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the clinic.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page.
 *     responses:
 *       200:
 *         description: A list of providers associated with the clinic.
 */
router.get(
  '/',
  validateRequest({
    params: listProvidersForClinicSchema.shape.params,
    query: listProvidersForClinicSchema.shape.query,
  }),
  clinicProviderController.listProviders
);

/**
 * @openapi
 * /api/v1/admin/clinics/{clinicId}/providers:
 *   post:
 *     tags:
 *       - Admin Clinic Providers
 *     summary: Associate a provider with a clinic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the clinic.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               providerId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Provider associated successfully.
 *       404:
 *         description: Clinic or Provider not found.
 *       409:
 *         description: Conflict (provider already associated with the clinic).
 */
router.post(
  '/',
  validateRequest({
    params: associateProviderSchema.shape.params,
    body: associateProviderSchema.shape.body,
  }),
  clinicProviderController.associateProvider
);

/**
 * @openapi
 * /api/v1/admin/clinics/{clinicId}/providers/{providerId}:
 *   delete:
 *     tags:
 *       - Admin Clinic Providers
 *     summary: Disassociate a provider from a clinic
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the clinic.
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the provider to disassociate.
 *     responses:
 *       200:
 *         description: Provider disassociated successfully.
 *       404:
 *         description: Association not found.
 */
router.delete(
  '/:providerId',
  validateRequest({ params: disassociateProviderSchema.shape.params }),
  clinicProviderController.disassociateProvider
);

export default router; 