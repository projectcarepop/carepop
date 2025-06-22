import app from '../../app';
import { db, client } from '../../db/drizzle';
import { services, specializations } from '../../db/schema';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('Services API', () => {

    beforeAll(async () => {
        // Clear tables before tests
        await db.delete(services);
        await db.delete(specializations);
    });

    it('should fetch all services when no filter is applied', async () => {
        const spec1 = await db.insert(specializations).values({ name: 'General Medicine' }).returning();
        await db.insert(services).values([
            { name: 'Annual Check-up', specializationId: spec1[0].id },
            { name: 'Follow-up Consultation', specializationId: spec1[0].id }
        ]);

        const req = new Request('http://localhost/api/v1/services');
        const res = await app.request(req);
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(data).toBeInstanceOf(Array);
        expect(data.length).toBe(2);
    });

    it('should fetch only filtered services when specializationId is provided', async () => {
        await db.delete(services);
        await db.delete(specializations);

        const spec2 = await db.insert(specializations).values({ name: 'Dental' }).returning();
        const spec3 = await db.insert(specializations).values({ name: 'Cardiology' }).returning();
        await db.insert(services).values([
            { name: 'Tooth Cleaning', specializationId: spec2[0].id },
            { name: 'Heart Scan', specializationId: spec3[0].id }
        ]);

        const req = new Request(`http://localhost/api/v1/services?specializationId=${spec2[0].id}`);
        const res = await app.request(req);
        const data = await res.json();
        
        expect(res.status).toBe(200);
        expect(data).toBeInstanceOf(Array);
        expect(data.length).toBe(1);
        expect(data[0].name).toBe('Tooth Cleaning');
    });
    
    afterAll(async () => {
        await db.delete(services);
        await db.delete(specializations);
        await client.end();
    });
}); 