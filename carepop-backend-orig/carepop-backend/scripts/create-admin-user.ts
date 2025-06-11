import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables must be set');
  process.exit(1);
}

// Create Supabase client with service role key (admin privileges)
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createSuperAdmin(email: string, password: string) {
  try {
    console.log(`Creating super admin user with email: ${email}`);
    
    // Step 1: Create a new user with the service role client
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      app_metadata: { 
        role: 'admin' // Set the role in app_metadata
      }
    });

    if (userError) {
      throw new Error(`Failed to create user: ${userError.message}`);
    }

    console.log(`User created successfully: ${userData.user.id}`);

    // Step 2: Insert a profile record with the admin information
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userData.user.id,
        first_name: 'Admin',
        last_name: 'User',
        date_of_birth: '1990-01-01', // Placeholder date
        phone_number: `admin-${Date.now()}`, // Unique placeholder
        address: 'Admin Office',
        granular_consents: { admin_user: true },
        role: 'admin' // Set the role in the profile record
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    console.log('Profile created successfully:');
    console.log(profileData);
    
    console.log('\nAdmin user creation completed successfully!');
    console.log(`Login with email: ${email} and the password you provided.`);
    console.log('Note: This admin user bypasses the profile creation requirement.');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: ts-node create-admin-user.ts <email> <password>');
  process.exit(1);
}

// Execute the function
createSuperAdmin(email, password); 