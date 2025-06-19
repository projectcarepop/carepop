import winston from 'winston';
// import { LoggingWinston } from '@google-cloud/logging-winston';
import { getConfig } from '../config/config';

const config = getConfig();

// Create a Winston logger that streams to Stackdriver Logging
// Logs will be written to: "projects/your-gcp-project-id/logs/winston"
// const loggingWinston = new LoggingWinston();

// Basic console transport
const consoleTransport = new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
        })
    )
});

const logger = winston.createLogger({
    level: config.nodeEnv === 'development' ? 'debug' : 'info',
    format: winston.format.json(),
    transports: [
        consoleTransport
        // In a real setup, you would add the Google Cloud transport back
        // new winston.transports.Console(),
        // loggingWinston
    ],
});

export default logger; 