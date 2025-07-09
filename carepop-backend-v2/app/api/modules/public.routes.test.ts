import { describe, it, expect, vi } from 'vitest';
import publicRoutes from './public.routes';
import { db } from '../lib/db';
import { clinics, doctors, services, doctorClinics, doctorClinicServices, appointments } from '../../../drizzle/schema';

// Mock the database dependency
vi.mock('../lib/db', () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValueOnce([]).mockResolvedValue([]),
    execute: vi.fn().mockResolvedValue([]),
    $query: vi.fn().mockReturnThis(),
    findMany: vi.fn().mockResolvedValue([]),
  },
}));

describe('Public API Routes', () => {

  it('GET /clinics should return 200 OK', async () => {
    const res = await publicRoutes.request('/clinics');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /doctors should return 200 OK', async () => {
    const res = await publicRoutes.request('/doctors');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /services should return 200 OK', async () => {
    const res = await publicRoutes.request('/services');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET /clinics/nearby should return 200 OK with valid params', async () => {
    const res = await publicRoutes.request('/clinics/nearby?lat=10&lon=10');
    expect(res.status).toBe(200);
  });

  it('GET /clinics/nearby should return 400 Bad Request with invalid params', async () => {
    const res = await publicRoutes.request('/clinics/nearby?lat=abc&lon=def');
    expect(res.status).toBe(400);
  });
});

describe('Public API Routes - /clinics Endpoint (Integration)', () => {
    it('should return only clinics offering a specific service when serviceId is provided', async () => {
        const service1 = await db.insert(services).values({ name: 'Teleconsultation', price: "500.00", durationMinutes: 30 }).returning();
        const doctor1 = await db.insert(doctors).values({ fullName: 'Dr. Test' }).returning();
        const clinic1 = await db.insert(clinics).values({ name: 'Test Clinic A' }).returning();
        const clinic2 = await db.insert(clinics).values({ name: 'Test Clinic B' }).returning();

        // This now creates the specific link between a doctor, a service, AND a clinic.
        await db.insert(doctorClinicServices).values({ 
            doctorId: doctor1[0].id, 
            serviceId: service1[0].id,
            clinicId: clinic1[0].id 
        });
        await db.insert(doctorClinics).values({ doctorId: doctor1[0].id, clinicId: clinic1[0].id });
        
        const res = await publicRoutes.request(`/clinics?serviceId=${service1[0].id}`);
        const { data } = await res.json();
        
        expect(res.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBe(1);
        expect(data[0].id).toBe(clinic1[0].id);
        expect(data[0].name).toBe('Test Clinic A');
    });

    it('should return all active clinics when serviceId is not provided', async () => {
        const res = await publicRoutes.request('/clinics');
        const { data } = await res.json();

        expect(res.status).toBe(200);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeGreaterThanOrEqual(2);
    });
}); 