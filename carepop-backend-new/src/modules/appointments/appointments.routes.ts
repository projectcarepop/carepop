import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { appointmentService } from './appointments.service';
import {
  getServicesForClinicSchema,
  getProviderAvailabilitySchema,
  getAdminAppointmentsSchema,
  getAvailabilitySchema,
} from './appointments.validation';

const appointments = new Hono();

// GET /api/v1/appointments/clinics
appointments.get('/clinics', async (c) => {
  const clinics = await appointmentService.getClinics();
  return c.json(clinics);
});

// GET /api/v1/appointments/services?clinicId=...
appointments.get(
  '/services',
  zValidator('query', getServicesForClinicSchema),
  async (c) => {
    const { clinicId, specializationId } = c.req.valid('query');
    const services = await appointmentService.getServicesForClinic(clinicId, specializationId);
    return c.json(services);
  }
);

// GET /api/v1/appointments/service-availability?clinicId=...&serviceId=...&date=...
appointments.get(
  '/service-availability',
  zValidator('query', getAvailabilitySchema),
  async (c) => {
    const { clinicId, serviceId, date } = c.req.valid('query');
    const slots = await appointmentService.getServiceAvailabilityForClinic(clinicId, serviceId, date);
    return c.json(slots);
  }
);

// GET /api/v1/appointments/availability?providerId=...&date=...
appointments.get(
  '/availability',
  zValidator('query', getProviderAvailabilitySchema),
  async (c) => {
    const { providerId, date } = c.req.valid('query');
    const slots = await appointmentService.getProviderAvailability(providerId, date);
    return c.json(slots);
  }
);

// GET /api/v1/appointments/admin/appointments
appointments.get(
    '/admin/appointments',
    zValidator('query', getAdminAppointmentsSchema),
    async (c) => {
        const queryParams = c.req.valid('query');
        const data = await appointmentService.getAdminAppointments(queryParams);
        return c.json(data);
    }
)

// Routes will be added here

export default appointments; 