import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// Function to fetch secrets from GCP Secret Manager
async function getGcpSecret(secretName: string): Promise<string | null> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    console.error('GOOGLE_CLOUD_PROJECT environment variable not set.');
    return null; // Or throw an error
  }
  const client = new SecretManagerServiceClient();
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;

  try {
    const [version] = await client.accessSecretVersion({ name });
    const payload = version.payload?.data?.toString();
    if (!payload) {
      console.error(`Secret payload for ${secretName} is empty.`);
      return null;
    }
    return payload;
  } catch (error) {
    console.error(`Error accessing secret ${secretName}:`, error);
    return null; // Or throw an error
  }
}

let supabase: SupabaseClient;

async function initializeSupabase() {
  let supabaseUrl: string | null = null;
  let supabaseAnonKey: string | null = null;
  // Optional: Fetch service role key if needed later
  // let supabaseServiceKey: string | null = null; 

  // Check if running in a GCP environment (Cloud Run sets this automatically)
  if (process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT) {
    console.log('Running in GCP environment. Fetching secrets from Secret Manager...');
    supabaseUrl = await getGcpSecret('supabase-staging-url');
    supabaseAnonKey = await getGcpSecret('supabase-staging-anon-key');
    // supabaseServiceKey = await getGcpSecret('supabase-staging-service-role-key'); 
  } else {
    console.log('Running locally. Loading secrets from .env file...');
    // Load environment variables from .env file for local development
    dotenv.config();
    supabaseUrl = process.env.SUPABASE_URL || null;
    supabaseAnonKey = process.env.SUPABASE_ANON_KEY || null;
    // supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || null;
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    const message = 'Supabase URL or Anon Key is missing. Ensure configuration is correct (GCP Secret Manager or .env).';
    console.error(message);
    // Throw an error to prevent the application from starting incorrectly
    throw new Error(message); 
  }

  // Create a single supabase client instance
  supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('Supabase client initialized successfully.');
}

// Initialize Supabase async and handle potential errors
initializeSupabase().catch(error => {
  console.error("Failed to initialize Supabase client:", error);
  process.exit(1); // Exit if Supabase cannot be initialized
});

// Export the initialized client (it will be undefined until initializeSupabase completes)
// Consumers need to ensure initialization is complete, or handle the async nature.
// A better approach might be to export a promise or an initialization function.
// For simplicity now, we export the variable directly, assuming it's initialized before use.
export { supabase }; 