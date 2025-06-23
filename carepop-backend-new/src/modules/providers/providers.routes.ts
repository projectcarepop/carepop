import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { providersService } from './providers.service';
import { getProvidersForServiceSchema } from './providers.validation';
import { createProviderSchema, updateProviderSchema } from './providers.validation';

const providers = new Hono();

// GET /api/v1/providers (for admin)
providers.get('/', async (c) => {
    const allProviders = await providersService.getAllProvidersForAdmin();
    return c.json(allProviders);
});

// GET /api/v1/providers/for-service (public, but query-validated)
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

// GET /api/v1/providers/:id
providers.get('/:id', async (c) => {
    const id = c.req.param('id');
    const provider = await providersService.getProviderById(id);
    return c.json(provider);
});

// POST /api/v1/providers
providers.post('/', zValidator('json', createProviderSchema), async (c) => {
    const newProviderData = c.req.valid('json');
    const newProvider = await providersService.createProvider(newProviderData);
    return c.json(newProvider, 201);
});

// PATCH /api/v1/providers/:id
providers.patch('/:id', zValidator('json', updateProviderSchema), async (c) => {
    const id = c.req.param('id');
    const updatedProviderData = c.req.valid('json');
    const updatedProvider = await providersService.updateProvider(id, updatedProviderData);
    return c.json(updatedProvider);
});

// DELETE /api/v1/providers/:id
providers.delete('/:id', async (c) => {
    const id = c.req.param('id');
    const result = await providersService.deleteProvider(id);
    return c.json(result);
});

export default providers; 