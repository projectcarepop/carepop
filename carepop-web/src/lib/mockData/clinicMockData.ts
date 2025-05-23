export interface MockClinic {
  id: string; // UUID
  name: string;
  fullAddress: string; 
  latitude: number;
  longitude: number;
  contactPhone?: string | null;
  contactEmail?: string | null;
  operatingHoursSummary?: string; // e.g., "Mon-Fri: 9am-5pm"
  servicesOfferedSummary?: string[]; // e.g., ["Consultation", "Family Planning"]
  fpopChapterAffiliation?: string | null;
  isActive: boolean; 
  // distanceKm?: number; // If API calculates it
}

export const mockClinics: MockClinic[] = [
  {
    id: '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed',
    name: 'FPOP Quezon City - Example Clinic 1',
    fullAddress: '123 Example St, Diliman, Quezon City, Metro Manila',
    latitude: 14.6538,
    longitude: 121.0500,
    contactPhone: '02-8123-4567',
    contactEmail: 'qc.clinic1@fpop.example.org',
    operatingHoursSummary: 'Mon-Fri: 9am-5pm, Sat: 9am-12pm',
    servicesOfferedSummary: ['General Consultation', 'Family Planning Counseling', 'STI Testing'],
    fpopChapterAffiliation: 'NCR',
    isActive: true,
  },
  {
    id: '2c9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4cef',
    name: 'FPOP Manila - Example Clinic 2',
    fullAddress: '456 Sample Ave, Sta. Mesa, Manila, Metro Manila',
    latitude: 14.6000,
    longitude: 120.9833,
    contactPhone: '02-8765-4321',
    contactEmail: 'manila.clinic2@fpop.example.org',
    operatingHoursSummary: 'Mon-Sat: 8am-4pm',
    servicesOfferedSummary: ['Prenatal Checkup', 'Postnatal Care', 'Vaccinations'],
    fpopChapterAffiliation: 'NCR',
    isActive: true,
  },
  {
    id: '3d9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4cfa',
    name: 'FPOP Pasig - Community Health Point',
    fullAddress: '789 Test Blvd, Ortigas Center, Pasig City, Metro Manila',
    latitude: 14.5875,
    longitude: 121.0603,
    contactPhone: '02-8888-7777',
    contactEmail: 'pasig.clinic3@fpop.example.org',
    operatingHoursSummary: 'Mon-Fri: 10am-6pm',
    servicesOfferedSummary: ['Youth Counseling', 'HIV Testing', 'Contraceptives'],
    fpopChapterAffiliation: 'NCR',
    isActive: true,
  },
]; 