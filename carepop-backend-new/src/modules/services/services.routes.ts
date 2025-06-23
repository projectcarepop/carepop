import { Hono } from 'hono';
import { servicesService } from './services.service';
import { zValidator } from '@hono/zod-validator';
import { createServiceSchema, updateServiceSchema } from './services.validation';

const services = new Hono();

// GET /api/v1/services (for admin)
services.get('/', async (c) => {
  const allServices = await servicesService.getAllServicesForAdmin();
  return c.json(allServices);
});

// GET /api/v1/services/:id
services.get('/:id', async (c) => {
    const id = c.req.param('id');
    const service = await servicesService.getServiceById(id);
    return c.json(service);
});

// POST /api/v1/services
services.post('/', zValidator('json', createServiceSchema), async (c) => {
    const newServiceData = c.req.valid('json');
    const newService = await servicesService.createService(newServiceData);
    return c.json(newService, 201);
});

// PATCH /api/v1/services/:id
services.patch('/:id', zValidator('json', updateServiceSchema), async (c) => {
    const id = c.req.param('id');
    const updatedServiceData = c.req.valid('json');
    const updatedService = await servicesService.updateService(id, updatedServiceData);
    return c.json(updatedService);
});

// DELETE /api/v1/services/:id
services.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await servicesService.deleteService(id);
    return c.json(result);
});

export default services; 