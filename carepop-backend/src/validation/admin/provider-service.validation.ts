import { z } from 'zod';
import { commonSchemas } from '../commonSchemas';

export const providerServiceParams = z.object({
  providerId: commonSchemas.uuid,
});

export const serviceProvidersParams = z.object({
  serviceId: commonSchemas.uuid,
});

export const assignServiceBody = z.object({
  serviceId: commonSchemas.uuid,
});

export const unassignServiceParams = z.object({
  providerId: commonSchemas.uuid,
  serviceId: commonSchemas.uuid,
}); 