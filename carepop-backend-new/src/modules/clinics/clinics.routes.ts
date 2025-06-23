import { Hono } from 'hono';
import { clinicsService } from './clinics.service';
import { roleAuthorization } from '../../middleware/auth.middleware';
import { zValidator } from '@hono/zod-validator';
import { createClinicSchema, updateClinicSchema } from './clinics.validation';

const clinics = new Hono();

// GET /api/v1/clinics - accessible only by admins
clinics.get('/', roleAuthorization('admin'), async (c) => {
  const allClinics = await clinicsService.getAllClinicsForAdmin();
  return c.json(allClinics);
});

// GET /api/v1/clinics/:id
clinics.get('/:id', async (c) => {
    const id = c.req.param('id');
    const clinic = await clinicsService.getClinicById(id);
    return c.json(clinic);
});

// POST /api/v1/clinics
clinics.post('/', zValidator('json', createClinicSchema), async (c) => {
    const newClinicData = c.req.valid('json');
    const newClinic = await clinicsService.createClinic(newClinicData);
    return c.json(newClinic, 201);
});

// PATCH /api/v1/clinics/:id
clinics.patch('/:id', zValidator('json', updateClinicSchema), async (c) => {
    const id = c.req.param('id');
    const updatedClinicData = c.req.valid('json');
    const updatedClinic = await clinicsService.updateClinic(id, updatedClinicData);
    return c.json(updatedClinic);
});

// DELETE /api/v1/clinics/:id
clinics.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await clinicsService.deleteClinic(id);
    return c.json(result);
});

export default clinics; 