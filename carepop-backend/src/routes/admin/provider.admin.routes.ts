import { Router } from 'express';
import { AdminProviderController } from '../../controllers/admin/provider.admin.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { isAdmin } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validateRequest';
import {
  createProviderBodySchema,
  updateProviderBodySchema,
  listProvidersSchema,
  providerIdSchema,
} from '../../validation/admin/provider.admin.validation';

const router = Router();
const adminProviderController = new AdminProviderController();

/**
 * @openapi
 * /api/v1/admin/providers:
 *   post:
 *     tags:
 *       - Admin Providers
 *     summary: Create a new provider
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProviderBody' 
 *     responses:
 *       201:
 *         description: Provider created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProviderResponse'
 *       400:
 *         description: Bad request (e.g., validation error).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 */
router.post(
  '/',
  authenticateToken,
  isAdmin,
  validateRequest({ body: createProviderBodySchema }),
  adminProviderController.createProvider
);

/**
 * @openapi
 * /api/v1/admin/providers:
 *   get:
 *     tags:
 *       - Admin Providers
 *     summary: List all providers
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [lastName, firstName, specialization, createdAt, updatedAt]
 *           default: createdAt
 *         description: Field to sort by.
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending).
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search term for name or specialization.
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status.
 *     responses:
 *       200:
 *         description: A list of providers.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListProvidersResponse' 
 *       400:
 *         description: Bad request (e.g., invalid query parameters).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 */
router.get(
  '/',
  authenticateToken,
  isAdmin,
  validateRequest({ query: listProvidersSchema.shape.query }),
  adminProviderController.listProviders
);

/**
 * @openapi
 * /api/v1/admin/providers/{providerId}:
 *   get:
 *     tags:
 *       - Admin Providers
 *     summary: Get a specific provider by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the provider.
 *     responses:
 *       200:
 *         description: Provider details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProviderResponse'
 *       400:
 *         description: Bad request (e.g., invalid UUID format).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Provider not found.
 */
router.get(
  '/:providerId',
  authenticateToken,
  isAdmin,
  validateRequest({ params: providerIdSchema.shape.params }),
  adminProviderController.getProviderById
);

/**
 * @openapi
 * /api/v1/admin/providers/{providerId}:
 *   put:
 *     tags:
 *       - Admin Providers
 *     summary: Update a provider
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the provider to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProviderBody'
 *     responses:
 *       200:
 *         description: Provider updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProviderResponse'
 *       400:
 *         description: Bad request (e.g., validation error, invalid UUID).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Provider not found.
 */
router.put(
  '/:providerId',
  authenticateToken,
  isAdmin,
  validateRequest({
    body: updateProviderBodySchema,
    params: providerIdSchema.shape.params 
  }),
  adminProviderController.updateProvider
);

/**
 * @openapi
 * /api/v1/admin/providers/{providerId}:
 *   delete:
 *     tags:
 *       - Admin Providers
 *     summary: Delete a provider (or mark as inactive)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the provider to delete.
 *     responses:
 *       204:
 *         description: Provider deleted successfully.
 *       400:
 *         description: Bad request (e.g., invalid UUID format).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (user is not an admin).
 *       404:
 *         description: Provider not found.
 */
router.delete(
  '/:providerId',
  authenticateToken,
  isAdmin,
  validateRequest({ params: providerIdSchema.shape.params }),
  adminProviderController.deleteProvider
);

export default router; 