import express, { Router, RequestHandler } from 'express';
import {
  searchClinics,
  getClinicById,
  getAllClinics
} from '../controllers/directoryController'; // Assuming controller will be created here

console.log('[directoryRoutes.ts] File loaded');

const router: Router = express.Router();

/**
 * @openapi
 * /api/v1/directory/clinics:
 *   get:
 *     summary: Retrieve all active clinics
 *     description: Fetches a list of all active clinics. Basic listing, not for searching.
 *     tags:
 *       - Directory
 *     responses:
 *       200:
 *         description: A list of active clinics.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Clinic' # Assuming Clinic schema defined
 *       500:
 *         description: Internal server error
 */
router.get('/clinics', (req, res, next) => {
  console.log('[directoryRoutes.ts] GET /clinics route hit');
  (getAllClinics as RequestHandler)(req, res, next);
});

/**
 * @openapi
 * /api/v1/directory/clinics/search:
 *   get:
 *     summary: Search for clinics
 *     description: >
 *       Searches for clinics based on various criteria including keywords, location (latitude, longitude, radius),
 *       and specific services offered.
 *     tags:
 *       - Directory
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: false
 *         description: Keyword search term (searches clinic name and address).
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *           format: float
 *         required: false
 *         description: Latitude for proximity search. Requires longitude and radiusKm.
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *           format: float
 *         required: false
 *         description: Longitude for proximity search. Requires latitude and radiusKm.
 *       - in: query
 *         name: radiusKm
 *         schema:
 *           type: number
 *           format: float
 *         required: false
 *         description: Search radius in kilometers for proximity search. Requires latitude and longitude.
 *       - in: query
 *         name: serviceIds
 *         schema:
 *           type: string # Can also be array depending on client qs stringify
 *         required: false
 *         description: Comma-separated list of service UUIDs to filter clinics by.
 *         example: "uuid1,uuid2,uuid3"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: Number of results per page.
 *     responses:
 *       200:
 *         description: A list of clinics matching the search criteria, with pagination details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ClinicSearchResult' # Or your specific search result schema
 *                 totalCount:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *                 message:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Invalid query parameters.
 *       500:
 *         description: Internal server error.
 */
router.get('/clinics/search', searchClinics as RequestHandler);

/**
 * @openapi
 * /api/v1/directory/clinics/{clinicId}:
 *   get:
 *     summary: Retrieve a specific clinic by its ID
 *     description: Fetches details for a single active clinic by its UUID.
 *     tags:
 *       - Directory
 *     parameters:
 *       - in: path
 *         name: clinicId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The UUID of the clinic to retrieve.
 *     responses:
 *       200:
 *         description: Detailed information about the clinic.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Clinic' # Assuming Clinic schema defined
 *       404:
 *         description: Clinic not found or not active.
 *       500:
 *         description: Internal server error.
 */
router.get('/clinics/:clinicId', getClinicById as RequestHandler);

export default router; 