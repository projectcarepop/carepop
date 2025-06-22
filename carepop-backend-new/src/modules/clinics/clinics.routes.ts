import { Hono } from 'hono';
import { clinicsService } from './clinics.service';
import { roleAuthorization } from '../../middleware/auth.middleware';

const clinics = new Hono();

// GET /api/v1/clinics - accessible only by admins
clinics.get('/', roleAuthorization('admin'), async (c) => {
  const allClinics = await clinicsService.getAllClinics();
  return c.json(allClinics);
});

// We will add more routes (GET by ID, POST, PATCH, DELETE) here later.

export default clinics; 