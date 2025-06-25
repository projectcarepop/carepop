import { describe, it, expect, vi } from 'vitest';
import publicRoutes from './public.routes';
import { db } from '../lib/db';
import { clinics, doctors, services, doctorClinics, doctorServices, providerAvailability, appointments } from '../../../drizzle/schema';

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

        await db.insert(doctorServices).values({ doctorId: doctor1[0].id, serviceId: service1[0].id });
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

describe('Public API Routes - /availability Endpoint (Integration)', () => {
  it('should return available slots for a doctor, excluding booked times', async () => {
    // 1. Seed Data
    const serviceResult = await db.insert(services).values({ name: 'Specialized Check-up', price: "1500.00", durationMinutes: 30 }).returning();
    const service1 = serviceResult[0];
    const doctorResult = await db.insert(doctors).values({ fullName: 'Dr. Availability' }).returning();
    const doctor1 = doctorResult[0];
    const clinicResult = await db.insert(clinics).values({ name: 'The Availability Clinic' }).returning();
    const clinic1 = clinicResult[0];

    // Link associations
    await db.insert(doctorServices).values({ doctorId: doctor1.id, serviceId: service1.id });
    await db.insert(doctorClinics).values({ doctorId: doctor1.id, clinicId: clinic1.id });
    
    // Set doctor's general availability (e.g., on WEDNESDAY)
    const testDate = "2024-10-23"; // This is a Wednesday
    await db.insert(providerAvailability).values({
      doctorId: doctor1.id,
      dayOfWeek: 'WEDNESDAY',
      startTime: '09:00:00',
      endTime: '12:00:00',
      isAvailable: true,
    });

    // Create a pre-existing appointment to block a slot
    const bookedTime = new Date(`${testDate}T10:00:00.000Z`);
    await db.insert(appointments).values({
      patientId: 'some-fake-patient-uuid', // a valid UUID is needed for FK constraint
      doctorId: doctor1.id,
      serviceId: service1.id,
      clinicId: clinic1.id,
      appointmentTime: bookedTime.toISOString(),
      status: 'scheduled',
    });

    // 2. Make Request
    const res = await publicRoutes.request(`/availability?serviceId=${service1.id}&clinicId=${clinic1.id}&date=${testDate}`);
    const { data } = await res.json();
    
    // 3. Assert
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBe(1);
    expect(data[0].doctorId).toBe(doctor1.id);
    
    const expectedSlots = ["09:00", "09:30", "10:30", "11:00", "11:30"];
    expect(data[0].availableSlots).toEqual(expectedSlots);
    expect(data[0].availableSlots).not.toContain("10:00");
  });
}); 