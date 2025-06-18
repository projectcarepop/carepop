import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const CLINIC_NAME = 'CarePoP Test Clinic';
const PATIENT_EMAIL = 'patient@test.com';
const PROVIDER_NAME = 'Dr. Test';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Upsert Clinic
    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .upsert({ name: CLINIC_NAME, address: '123 Test St', city: 'Testville', phone_number: '123-456-7890' }, { onConflict: 'name', ignoreDuplicates: false })
      .select()
      .single();
    if (clinicError && clinicError.code !== '23505') throw clinicError;
    console.log(`🏥 Clinic "${clinic.name}" ensured with ID: ${clinic.id}`);

    // 2. Upsert Patient (User & Profile)
    let { data: patientUser } = await supabase.auth.admin.getUserByEmail(PATIENT_EMAIL);
    if (!patientUser?.user) {
        const { data: newUser, error: userError } = await supabase.auth.admin.createUser({
            email: PATIENT_EMAIL,
            password: 'password',
            email_confirm: true,
        });
        if (userError) throw userError;
        patientUser = { user: newUser.user };
        console.log(`👤 New patient user created: ${patientUser.user.email}`);

        const { error: profileError } = await supabase.from('profiles').insert({
            user_id: patientUser.user.id,
            first_name: 'Test',
            last_name: 'Patient',
            role: 'patient',
        });
        if (profileError) throw profileError;
    } else {
        console.log(`👤 Patient user "${patientUser.user.email}" already exists.`);
    }
    const patientUserId = patientUser.user.id;
    console.log(`🧑‍⚕️ Patient User ID: ${patientUserId}`);


    // 3. Upsert Provider
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .upsert({ full_name: PROVIDER_NAME, specialization: 'General Testology' }, { onConflict: 'full_name', ignoreDuplicates: false })
      .select()
      .single();
    if (providerError && providerError.code !== '23505') throw providerError;
    console.log(`🩺 Provider "${provider.full_name}" ensured with ID: ${provider.id}`);


    // 4. Upsert Service
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .upsert({ name: 'Routine Check-up', description: 'A standard check-up.', price: 100.00, clinic_id: clinic.id }, { onConflict: 'name, clinic_id', ignoreDuplicates: false })
      .select()
      .single();
    if (serviceError && serviceError.code !== '23505') throw serviceError;
    console.log(`✅ Service "${service.name}" ensured with ID: ${service.id}`);


    // 5. Create Appointments
    console.log('🗓️ Creating appointments...');
    const appointmentsToCreate = [
      { status: 'confirmed', appointment_datetime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() }, // In 2 days
      { status: 'pending', appointment_datetime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() }, // In 3 days
      { status: 'completed', appointment_datetime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() }, // 5 days ago
      { status: 'cancelled', appointment_datetime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }, // 2 days ago
    ];

    for (const appt of appointmentsToCreate) {
        const { error } = await supabase.from('appointments').insert({
            clinic_id: clinic.id,
            user_id: patientUserId,
            provider_id: provider.id,
            service_id: service.id,
            appointment_datetime: appt.appointment_datetime,
            status: appt.status,
            notes_patient: `This is a seed-generated appointment with status: ${appt.status}.`,
        });
        if (error) {
            console.error(`Error creating ${appt.status} appointment:`, error.message);
        } else {
            console.log(`- Created ${appt.status} appointment.`);
        }
    }

    console.log('✅ Seeding complete!');
  } catch (error) {
    const err = error as Error;
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedDatabase(); 