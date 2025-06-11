import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';

// Determine if running in a GCP environment
const isGcp = !!(process.env.K_SERVICE || process.env.GOOGLE_CLOUD_PROJECT);

// Create a Winston logger instance

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }), // Log stack traces
    winston.format.splat(),
    // Use JSON format for GCP, otherwise use a simpler console format
    isGcp ? winston.format.json() : winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    })
);

// Define transports
const transports: winston.transport[] = [
    new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'info', // Default to 'info' level
        format: logFormat
    })
];

// Add Google Cloud Logging transport if running in GCP
if (isGcp) {
    console.log('Configuring Google Cloud Logging transport...');
    transports.push(new LoggingWinston({
        level: process.env.LOG_LEVEL || 'info',
        // Optional: Add labels or resource info if needed
        // labels: { module: 'carepop-backend' },
        // resource: { type: 'cloud_run_revision', labels: { /* ... */ } }
    }));
}

const logger = winston.createLogger({
    // level: process.env.LOG_LEVEL || 'info', // Set level on transports instead
    format: logFormat, // Apply format to the logger itself might be redundant if set on all transports
    transports: transports,
    exitOnError: false, // Do not exit on handled exceptions
});


// Example usage:
// logger.info('This is an info message');
// logger.warn('This is a warning');
// logger.error('This is an error message', new Error('Something went wrong'));

console.log(`Logger configured. GCP environment detected: ${isGcp}. Log level: ${process.env.LOG_LEVEL || 'info'}`);

export default logger; 