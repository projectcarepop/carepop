import { Router } from 'express';
import * as navigationController from '@/controllers/public/navigationController';

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
router.post('/route', navigationController.getRoute);

export default router; 