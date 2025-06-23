import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { bookingService } from './booking.service';
import {
  getServicesForClinicSchema,
  getProviderAvailabilitySchema,
} from './booking.validation';

const booking = new Hono();

// GET /api/v1/booking/clinics
booking.get('/clinics', async (c) => {
  const allClinics = await bookingService.getAllClinics();
  return c.json(allClinics);
});

// GET /api/v1/booking/services?clinicId=...
booking.get(
  '/services',
  zValidator('query', getServicesForClinicSchema),
  async (c) => {
    const { clinicId } = c.req.valid('query');
    const services = await bookingService.getServicesForClinic(clinicId);
    return c.json(services);
  }
);

// GET /api/v1/booking/availability?providerId=...&date=...
booking.get(
  '/availability',
  zValidator('query', getProviderAvailabilitySchema),
  async (c) => {
    const { providerId, date } = c.req.valid('query');
    const slots = await bookingService.getProviderAvailability(providerId, date);
    return c.json(slots);
  }
);

// Routes will be added here

export default booking; 