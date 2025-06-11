import { KeyManagementServiceClient } from '@google-cloud/kms';
import crypto from 'crypto';
import {getConfig} from '../config/config'; // For loading KMS key details

// TODO: Ensure these are configured in your .env and loaded via config.ts
// For a college project, you might hardcode these for initial testing if Secret Manager setup is too complex,
// BUT FOR PRODUCTION, ALWAYS USE SECRET MANAGER.
const { projectId, locationId, keyRingId, keyId } = getConfig().kms;

class EncryptionService {
    private kmsClient: KeyManagementServiceClient;
    private kmsKeyName: string;

    constructor() {
        this.kmsClient = new KeyManagementServiceClient();
        if (!projectId || !locationId || !keyRingId || !keyId) {
            console.error('KMS configuration is missing. Ensure projectId, locationId, keyRingId, and keyId are set.');
            // Throw an error or handle appropriately. For now, we'll let it potentially fail at keyName construction.
        }
        this.kmsKeyName = this.kmsClient.cryptoKeyPath(
            projectId || 'your-gcp-project-id',       // Fallback only for preventing constructor crash
            locationId || 'global',                     // Fallback
            keyRingId || 'your-key-ring-id',            // Fallback
            keyId || 'your-key-id'                      // Fallback
        );
        if (!projectId || !locationId || !keyRingId || !keyId) {
            console.warn(`EncryptionService initialized with placeholder KMS key name due to missing configuration: ${this.kmsKeyName}. This service will not function correctly.`);
        }
    }

    /**
     * Encrypts plaintext using AES-256-GCM with a DEK from KMS (Envelope Encryption).
     * @param plaintext The string to encrypt.
     * @returns A string containing the wrapped DEK, IV, authTag, and ciphertext, colon-separated and base64 encoded.
     * @throws Error if KMS configuration is missing or encryption/wrapping fails.
     */
    async encrypt(plaintext: string): Promise<string> {
        if (!projectId || !locationId || !keyRingId || !keyId) {
            throw new Error('KMS configuration is incomplete. Cannot encrypt.');
        }
        // 1. Generate a unique Data Encryption Key (DEK) for this piece of data.
        const dek = crypto.randomBytes(32); // 256-bit key for AES-256

        // 2. Encrypt the DEK with KMS (Wrap Key).
        let wrappedDekBase64: string;
        try {
            const [wrapResponse] = await this.kmsClient.encrypt({
                name: this.kmsKeyName, // This is the KMS Key Encryption Key (KEK)
                plaintext: dek,
            });
            if (!wrapResponse.ciphertext) {
                throw new Error('KMS wrapping failed to return ciphertext for DEK.');
            }
            wrappedDekBase64 = (wrapResponse.ciphertext as Buffer).toString('base64');
        } catch (error) {
            console.error('KMS DEK wrapping error:', error);
            throw new Error(`KMS DEK wrapping failed: ${error instanceof Error ? error.message : String(error)}`);
        }

        // 3. Encrypt the actual plaintext data using the (plaintext) DEK with AES-256-GCM.
        const iv = crypto.randomBytes(12); // 96-bit IV for GCM, a standard size
        const cipher = crypto.createCipheriv('aes-256-gcm', dek, iv);
        let encryptedData = cipher.update(plaintext, 'utf8', 'base64');
        encryptedData += cipher.final('base64');
        const authTag = cipher.getAuthTag();

        // 4. Return a combined string: base64(wrappedDek):base64(iv):base64(authTag):base64(encryptedData)
        return `${wrappedDekBase64}:${iv.toString('base64')}:${authTag.toString('base64')}:${encryptedData}`;
    }

    /**
     * Decrypts a ciphertext blob previously encrypted with the encrypt method.
     * @param ciphertextBlob The combined string of wrapped DEK, IV, authTag, and ciphertext.
     * @returns The original plaintext string.
     * @throws Error if KMS configuration is missing, or if parsing, unwrapping, or decryption fails.
     */
    async decrypt(ciphertextBlob: string): Promise<string> {
        if (!projectId || !locationId || !keyRingId || !keyId) {
            throw new Error('KMS configuration is incomplete. Cannot decrypt.');
        }

        // 1. Parse the combined string.
        const parts = ciphertextBlob.split(':');
        if (parts.length !== 4) {
            throw new Error('Invalid ciphertext format. Expected 4 colon-separated parts.');
        }
        const wrappedDek = Buffer.from(parts[0], 'base64');
        const iv = Buffer.from(parts[1], 'base64');
        const authTag = Buffer.from(parts[2], 'base64');
        const encryptedData = parts[3]; // Already base64 encoded

        // 2. Decrypt the DEK with KMS (Unwrap Key).
        let dek: Buffer;
        try {
            const [unwrapResponse] = await this.kmsClient.decrypt({
                name: this.kmsKeyName, // KEK
                ciphertext: wrappedDek,
            });
            if (!unwrapResponse.plaintext) {
                throw new Error('KMS unwrapping failed to return plaintext DEK.');
            }
            dek = unwrapResponse.plaintext as Buffer;
        } catch (error) {
            console.error('KMS DEK unwrapping error:', error);
            throw new Error(`KMS DEK unwrapping failed: ${error instanceof Error ? error.message : String(error)}`);
        }

        // 3. Decrypt the actual data using the (plaintext) DEK.
        try {
            const decipher = crypto.createDecipheriv('aes-256-gcm', dek, iv);
            decipher.setAuthTag(authTag);
            let decryptedText = decipher.update(encryptedData, 'base64', 'utf8');
            decryptedText += decipher.final('utf8');
            return decryptedText;
        } catch (error) {
            console.error('AES-256-GCM decryption error:', error);
            throw new Error(`AES-256-GCM decryption failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}

export default EncryptionService; 