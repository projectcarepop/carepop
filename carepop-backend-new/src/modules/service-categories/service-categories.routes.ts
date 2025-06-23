import { Hono } from 'hono';
import { serviceCategoriesService } from './service-categories.service';

const serviceCategories = new Hono();

// GET /api/v1/service-categories
serviceCategories.get('/', async (c) => {
  const allServiceCategories = await serviceCategoriesService.getAllServiceCategories();
  return c.json(allServiceCategories);
});

export default serviceCategories; 