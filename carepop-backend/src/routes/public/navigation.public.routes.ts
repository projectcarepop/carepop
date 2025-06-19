import { Router } from 'express';
import { navigationController } from '../../controllers/public/navigation.public.controller';
import { validate } from '../../lib/middleware/validate';
import { getDirectionsSchema } from '../../validation/public/navigation.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

/**
 * @swagger
 * /api/v1/public/navigation/route:
 *   post:
 *     summary: Get a route for navigation
 *     tags: [Public - Navigation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               start:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *               end:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                   lon:
 *                     type: number
 *     responses:
 *       200:
 *         description: The calculated route
 */

router.post(
  '/directions',
  validate(getDirectionsSchema),
  asyncHandler(navigationController.getDirections)
);

export default router; 