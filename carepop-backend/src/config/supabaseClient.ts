import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Keep a reference to the initialized Supabase URL
let initializedSupabaseUrl: string | null = null;

// Function to fetch secrets from GCP Secret Manager
async function getGcpSecret(secretName: string): Promise<string | null> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    // Allow falling back to .env locally even if project ID isn't set
    // console.warn('GOOGLE_CLOUD_PROJECT environment variable not set. Assuming local execution.');
    return null;
  }
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();
    if (!payload) {
      console.warn(`Secret payload for ${secretName} is empty in GCP.`); // Warn instead of error
      return null;
    }
    return payload;
  } catch (error) {
    // Log error but allow fallback to .env
    console.warn(`Error accessing secret ${secretName} in GCP, falling back to .env if possible:`, error);
    return null;
  }
}

// Rename the standard client variable for clarity
let supabaseAnonClient: SupabaseClient;
// Add a variable for the service role client
let supabaseServiceRoleClient: SupabaseClient;


async function initializeSupabase() {
  let supabaseUrl: string | null = null;
  let supabaseAnonKey: string | null = null;
  // Add variable for service role key
  let supabaseServiceKey: string | null = null;

  // Check if running in a GCP environment (Cloud Run sets this automatically)
  if (process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT) {
    console.log('Running in GCP environment. Fetching secrets from Secret Manager...');
    supabaseUrl = await getGcpSecret('supabase-staging-url');
    supabaseAnonKey = await getGcpSecret('supabase-staging-anon-key');
    // Fetch service role key from GCP
    supabaseServiceKey = await getGcpSecret('supabase-staging-service-role-key');
  }

  // Always try loading from .env as a fallback or for local dev
  console.log('Loading secrets from .env file (if present)...');
  dotenv.config(); // Load environment variables from .env file

  // Use .env values if GCP values weren't found or if running locally
  if (!supabaseUrl) supabaseUrl = process.env.SUPABASE_URL || null;
  if (!supabaseAnonKey) supabaseAnonKey = process.env.SUPABASE_ANON_KEY || null;
  if (!supabaseServiceKey) supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;


  // Validate required keys
  if (!supabaseUrl) {
      throw new Error('Supabase URL is missing. Ensure configuration is correct (GCP Secret Manager or .env).');
  }
  if (!supabaseAnonKey) {
      throw new Error('Supabase Anon Key is missing. Ensure configuration is correct (GCP Secret Manager or .env).');
  }
   if (!supabaseServiceKey) {
      // Throw error only if service key is absolutely required at startup,
      // otherwise just warn and let parts of the app fail if they try to use it.
      // For profile creation, it IS required.
      throw new Error('Supabase Service Role Key is missing. Ensure configuration is correct (GCP Secret Manager or .env).');
  }

  initializedSupabaseUrl = supabaseUrl; // Store for use in createSupabaseClientWithToken

  // Create the standard anon client instance
  supabaseAnonClient = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase anon client initialized successfully.');

  // Create the service role client instance
  supabaseServiceRoleClient = createClient(supabaseUrl, supabaseServiceKey);
  console.log('Supabase service role client initialized successfully.');

}

// Initialize Supabase async and handle potential errors
initializeSupabase().catch(error => {
  console.error("Failed to initialize Supabase clients:", error);
  process.exit(1); // Exit if Supabase cannot be initialized
});

// Export both initialized clients
export { supabaseAnonClient as supabase, supabaseServiceRoleClient as supabaseServiceRole }; 

// Export a function to create a new client instance scoped with a user's JWT
export const createSupabaseClientWithToken = (accessToken: string): SupabaseClient => {
  if (!initializedSupabaseUrl) { // Check if the URL was initialized
    throw new Error('Supabase URL has not been initialized. Cannot create user-scoped client.');
  }
  // It's important to use the supabaseAnonKey here for the initial client creation.
  // The user's permissions are then applied via the Authorization header.
  return createClient(initializedSupabaseUrl, process.env.SUPABASE_ANON_KEY!, { 
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    // Optional: autoRefreshToken, persistSession, detectSessionInUrl can be configured if needed
    // For server-side, typically you manage the token lifecycle.
  });
}; 