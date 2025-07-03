import { VertexAI } from '@google-cloud/vertexai';

// 1. Get and validate all necessary environment variables at startup.
const project = process.env.GOOGLE_CLOUD_PROJECT;
const location = process.env.GOOGLE_CLOUD_LOCATION;
const gcp_creds_json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

if (!project || !location || !gcp_creds_json) {
  console.error("FATAL ERROR: Google Cloud environment variables (PROJECT, LOCATION, or CREDENTIALS_JSON) are not set.");
  // In a real app, you might want a more graceful shutdown, but for development,
  // throwing an error makes the problem immediately obvious.
  throw new Error("Missing Google Cloud configuration.");
}

// 2. The Google SDK will automatically find and use the credentials
//    from the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.
const vertexAi = new VertexAI({ project, location });

// 3. Initialize and export the specific model we will use.
//    This makes it very easy to use in our route handlers.
export const generativeModel = vertexAi.getGenerativeModel({
  model: 'gemini-1.5-pro-preview-0514', // Use a valid and available model version
});

console.log("✅ Vertex AI service initialized successfully."); 