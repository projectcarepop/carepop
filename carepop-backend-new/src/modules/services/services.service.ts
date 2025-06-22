import { db } from '../../db/drizzle';
import { services } from '../../db/schema';
import { eq } from 'drizzle-orm';

class ServicesService {
    async getAllServices(specializationId?: string) {
        try {
            if (specializationId) {
                const filteredServices = await db.select().from(services).where(eq(services.specializationId, specializationId));
                return filteredServices;
            }
            const allServices = await db.select().from(services);
            return allServices;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw new Error('Could not fetch services.');
        }
    }
}

export const servicesService = new ServicesService(); 