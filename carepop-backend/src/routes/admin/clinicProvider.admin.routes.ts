import { Router } from 'express';
import { AdminClinicProviderController } from '@/controllers/admin/clinicProvider.admin.controller';
import { authMiddleware, isAdmin } from '@/middleware/authMiddleware';
import { validate } from '@/middleware/validate';
import { 
  associateProviderBodySchema, 
  listProvidersForClinicQuerySchema,
  clinicProviderPathParamsSchema 
} from '@/validation/admin/clinicProvider.admin.validation';

// This router will be merged with a :clinicId param, so we don't need to specify it here again.
const router = Router({ mergeParams: true }); 
const adminClinicProviderController = new AdminClinicProviderController();

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
 *             $ref: '#/components/schemas/AssociateProviderBody'
 *     responses:
 *       201:
 *         description: Provider associated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClinicProviderAssociationSuccessResponse'
 *       400:
 *         description: Bad request (e.g., invalid UUID, missing providerId).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Clinic or Provider not found.
 *       409:
 *         description: Conflict (provider already associated with the clinic).
 */
router.post(
  '/', 
  authMiddleware,
  isAdmin,
  validate({ body: associateProviderBodySchema }), 
  adminClinicProviderController.associateProvider
);

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListProvidersForClinicResponse'
 *       400:
 *         description: Bad request (e.g., invalid clinicId format).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Clinic not found.
 */
router.get(
  '/', 
  authMiddleware,
  isAdmin,
  validate({ query: listProvidersForClinicQuerySchema }), 
  adminClinicProviderController.listProviders
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClinicProviderAssociationSuccessResponse'
 *       204:
 *         description: Provider disassociated successfully (No Content).
 *       400:
 *         description: Bad request (e.g., invalid UUIDs).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Clinic, Provider, or Association not found.
 */
router.delete(
  '/:providerId',
  authMiddleware,
  isAdmin, 
  validate({ params: clinicProviderPathParamsSchema }), 
  adminClinicProviderController.disassociateProvider
);

export default router; 