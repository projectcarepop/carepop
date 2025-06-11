import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

interface KMSConfig {
    projectId: string;
    locationId: string;
    keyRingId: string;
    keyId: string;
}

interface AppConfig {
    nodeEnv: string;
    port: number;
    kms: KMSConfig;
    // Add other configurations here as needed (e.g., Supabase URL, anon key)
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey: string; // Be careful with this one
}

const config: AppConfig = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '8080', 10),
    kms: {
        projectId: process.env.GCP_PROJECT_ID || '',
        locationId: process.env.KMS_LOCATION_ID || 'global', // Default to global if not set
        keyRingId: process.env.KMS_KEY_RING_ID || '',
        keyId: process.env.KMS_KEY_ID || '',
    },
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

};

export const getConfig = (): Readonly<AppConfig> => {
    // Perform validation checks here if needed
    if (!config.kms.projectId) {
        console.warn('KMS Project ID is not set in environment variables.');
    }
    if (!config.kms.keyRingId) {
        console.warn('KMS Key Ring ID is not set in environment variables.');
    }
    if (!config.kms.keyId) {
        console.warn('KMS Key ID is not set in environment variables.');
    }
    if (!config.supabaseUrl) {
        console.warn('Supabase URL is not set.');
    }
    if (!config.supabaseAnonKey) {
        console.warn('Supabase Anon Key is not set.');
    }
     // Add more critical checks as needed

    return Object.freeze({ ...config }); // Return a frozen copy
};

export default config; // You can also export the frozen version by default 