// carepop-backend/src/testEncryption.ts
import EncryptionService from './services/encryptionService';

async function testEncryptionDecryption() {
    console.log('Starting encryption/decryption test...');

    // Ensure your .env file is populated with KMS details and loaded by config.ts
    // This script assumes config.ts correctly loads these when EncryptionService is instantiated.
    let encryptionService: EncryptionService;
    try {
        encryptionService = new EncryptionService();
        console.log('EncryptionService instantiated.');
    } catch (error) {
        console.error('Failed to instantiate EncryptionService:', error);
        console.error('Please ensure your .env file has correct GCP_PROJECT_ID, KMS_LOCATION_ID, KMS_KEY_RING_ID, and KMS_KEY_ID,');
        console.error('and that they are correctly loaded by src/config/config.ts.');
        console.error("Also verify Application Default Credentials (ADC) are set up correctly (run 'gcloud auth application-default login').");
        return;
    }

    const originalData = {
        sensitiveField1: "This is a highly secret value!",
        sensitiveField2: "Another piece of confidential info: 12345",
        nonSensitiveField: "This can remain plain text."
    };

    const dataToEncrypt = JSON.stringify({ // We typically encrypt a string representation
        sensitiveField1: originalData.sensitiveField1,
        sensitiveField2: originalData.sensitiveField2,
    });

    console.log('\nOriginal data to encrypt:', dataToEncrypt);

    try {
        // Test Encryption
        console.log('\nAttempting to encrypt data...');
        const encryptedData = await encryptionService.encrypt(dataToEncrypt);
        if (!encryptedData) {
            console.error('Encryption returned undefined. This should not happen if no error was thrown.');
            return;
        }
        console.log('Data encrypted successfully.');
        console.log('Encrypted data (string format):', encryptedData); // This will be a string like "iv:encryptedText:dek"

        // Test Decryption
        console.log('\nAttempting to decrypt data...');
        const decryptedDataString = await encryptionService.decrypt(encryptedData);
        if (!decryptedDataString) {
            console.error('Decryption returned undefined. This should not happen if no error was thrown.');
            return;
        }
        console.log('Data decrypted successfully.');
        console.log('Decrypted data (string):', decryptedDataString);

        // Verify
        if (decryptedDataString === dataToEncrypt) {
            console.log('\nSUCCESS: Decrypted data matches original data to encrypt.');
            const decryptedObject = JSON.parse(decryptedDataString);
            console.log('Decrypted object:', decryptedObject);
        } else {
            console.error('\nFAILURE: Decrypted data does NOT match original data to encrypt.');
            console.error('Original:', dataToEncrypt);
            console.error('Decrypted:', decryptedDataString);
        }

    } catch (error) {
        console.error('\nError during encryption/decryption process:', error);
        if (error instanceof Error && error.message.includes('PermissionDenied')) {
            console.error('This looks like a permission error. Ensure your ADC user or service account has the "Cloud KMS CryptoKey Encrypter/Decrypter" role on the specified key.');
        } else if (error instanceof Error && error.message.includes('NOT_FOUND')) {
             console.error('This looks like a "Not Found" error. Please verify your GCP_PROJECT_ID, KMS_LOCATION_ID, KMS_KEY_RING_ID, and KMS_KEY_ID in your .env file and in the Google Cloud Console.');
        }
    }
}

testEncryptionDecryption().catch(error => {
    console.error("Unhandled error in test script:", error);
});