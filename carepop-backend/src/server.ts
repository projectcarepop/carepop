import http from 'http';
import logger from './utils/logger';
import { supabase } from './config/supabaseClient'; // supabase is initialized async

const PORT = process.env.PORT || 8080; // Default to 8080 for Cloud Run

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ message: 'CarePoP Backend Placeholder' }));
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

console.log('Starting server...');

// Example basic server logic (replace with actual framework like Express later)
async function main() {
    logger.info('Backend service starting...');

    // Check if Supabase client is ready (due to async init)
    // In a real app, ensure this check or await mechanism is robust
    if (!supabase) {
        logger.error('Supabase client not initialized yet. Exiting.');
        process.exit(1);
    }

    logger.info('Supabase client seems ready.');

    // TODO: Add actual server setup (e.g., Express app)
    logger.info('Server setup placeholder. Listening for connections...');

    // Example: Log environment type
    const envType = process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT ? 'GCP' : 'Local';
    logger.info(`Running in environment: ${envType}`);

    // Example error log
    // try {
    //     throw new Error('Simulated startup error');
    // } catch (error) {
    //     logger.error('Caught an example error during startup', error);
    // }
}

// Handle potential errors during top-level await or async operations
main().catch(error => {
    logger.error('Unhandled error during server startup:', error);
    process.exit(1);
}); 