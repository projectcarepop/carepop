import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { providersService } from './providers.service';
import { getProvidersForServiceSchema } from './providers.validation';

const providers = new Hono();

providers.get(
  '/',
  zValidator('query', getProvidersForServiceSchema),
  async (c) => {
    const { clinicId, serviceId } = c.req.valid('query');
    const result = await providersService.getProvidersForService(
      clinicId,
      serviceId
    );
    return c.json(result);
  }
);

export default providers; 