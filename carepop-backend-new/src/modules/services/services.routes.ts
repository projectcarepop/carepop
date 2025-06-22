import { Hono } from 'hono';
import { servicesService } from './services.service';

const services = new Hono();

services.get('/', async (c) => {
    const { specializationId } = c.req.query();
    const allServices = await servicesService.getAllServices(specializationId);
    return c.json(allServices);
});

export default services; 