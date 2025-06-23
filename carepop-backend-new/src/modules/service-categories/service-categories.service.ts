import { db } from '../../db/drizzle';
import { ApiError } from '../../lib/errors';

async function getAllServiceCategories() {
  try {
    const data = await db.query.serviceCategories.findMany({
      columns: {
        id: true,
        name: true,
        description: true,
      },
      orderBy: (serviceCategories, { asc }) => [asc(serviceCategories.name)],
    });
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    throw new ApiError(500, `Could not retrieve service categories. Database error: ${errorMessage}`);
  }
}

export const serviceCategoriesService = {
  getAllServiceCategories,
}; 