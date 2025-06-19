import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getConfig } from './config';
// import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// This file handles the initialization of Supabase clients.
// It's structured to support both singleton instances and on-demand creation.

let supabaseAdmin: SupabaseClient | null = null;
let supabaseAnon: SupabaseClient | null = null;
// let secretManagerClient: SecretManagerServiceClient | null = null;

// const isProduction = process.env.NODE_ENV === 'production';

// --- Helper function to get secrets ---
/*
async function getSecret(secretName: string): Promise<string> {
    if (!secretManagerClient) {
        secretManagerClient = new SecretManagerServiceClient();
    }
    const [version] = await secretManagerClient.accessSecretVersion({
        name: `projects/${getConfig().kms.projectId}/secrets/${secretName}/versions/latest`,
    });
    const payload = version.payload?.data?.toString();
    if (!payload) {
        throw new Error(`Secret ${secretName} not found or has no data.`);
    }
    return payload;
}
*/

// --- Initialization Logic ---
// This promise will be awaited in server.ts to ensure clients are ready.
export const supabaseInitializationPromise = (async () => {
    try {
        const config = getConfig();
        const supabaseUrl = config.supabaseUrl;
        
        // In production, we'd fetch the keys from Secret Manager.
        // For this emergency fix, we'll use environment variables directly.
        const supabaseAnonKey = config.supabaseAnonKey;
        const supabaseServiceRoleKey = config.supabaseServiceRoleKey;

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
            throw new Error('Supabase URL or keys are not configured in environment variables.');
        }

        // Initialize clients
        supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
        supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

        console.log('Supabase clients initialized successfully.');

    } catch (error) {
        console.error('Failed to initialize Supabase clients:', error);
        // We re-throw the error to ensure the server initialization process fails
        // if Supabase cannot be initialized. This prevents the server from running
        // in a broken state.
        throw error;
    }
})();

// --- Getter Functions ---
// These functions provide access to the initialized clients.
// They ensure that code trying to use a client will get an error
// if initialization failed, rather than getting a `null` value.

export function getSupabaseAdmin(): SupabaseClient {
    if (!supabaseAdmin) {
        throw new Error('Supabase Admin client has not been initialized.');
    }
    return supabaseAdmin;
}

export function getSupabaseAnon(): SupabaseClient {
    if (!supabaseAnon) {
        throw new Error('Supabase Anon client has not been initialized.');
    }
    return supabaseAnon;
} 