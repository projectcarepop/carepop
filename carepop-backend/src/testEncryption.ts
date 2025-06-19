// carepop-backend/src/testEncryption.ts
import { EncryptionService } from './services/encryptionService';
import dotenv from 'dotenv';
import { getConfig } from './config/config';

// Load .env file for local testing
dotenv.config();

// Ensure your .env file is populated with KMS details and loaded by config.ts
const config = getConfig();

async function testEncryptionDecryption() {
    if (!config.kms.projectId || !config.kms.keyRingId || !config.kms.keyId) {
        console.error('Please ensure your .env file has correct GCP_PROJECT_ID, KMS_LOCATION_ID, KMS_KEY_RING_ID, and KMS_KEY_ID,');
        console.error('or that your application default credentials are set up correctly.');
        return;
    }

    const encryptionService = new EncryptionService();
    const originalText = `Hello, this is a secret message for CarePoP! Timestamp: ${new Date().toISOString()}`;

    console.log('Original Text:', originalText);
    console.log('---------------------------------');

    try {
        // Encrypt
        console.log('Encrypting...');
        const encryptedText = await encryptionService.encrypt(originalText);
        console.log('Encrypted Blob (Base64):', encryptedText);
        console.log('---------------------------------');

        // Decrypt
        console.log('Decrypting...');
        const decryptedText = await encryptionService.decrypt(encryptedText);
        console.log('Decrypted Text:', decryptedText);
        console.log('---------------------------------');

        // Verify
        if (originalText === decryptedText) {
            console.log('✅ Success: Decrypted text matches the original text.');
        } else {
            console.error('❌ Failure: Decrypted text does NOT match the original text.');
            console.error('Original:', originalText);
            console.error('Decrypted:', decryptedText);
        }

    } catch (error) {
        console.error('An error occurred during the encryption/decryption process:', error);
        
        // Add more specific error guidance
        if (error instanceof Error) {
            if (error.message.includes('Could not load the default credentials')) {
                console.error('This looks like an authentication error. Please run "gcloud auth application-default login" in your terminal.');
            } else if (error.message.includes('PermissionDenied')) {
                 console.error('This looks like a permission error. Ensure your ADC user or service account has the "Cloud KMS CryptoKey Encrypter/Decrypter" role on the specified key.');
            } else if (error.message.includes('NOT_FOUND')) {
                console.error('This looks like a "Not Found" error. Please verify your GCP_PROJECT_ID, KMS_LOCATION_ID, KMS_KEY_RING_ID, and KMS_KEY_ID in your .env file and in the Google Cloud Console.');
            }
        }
    }
}

testEncryptionDecryption();