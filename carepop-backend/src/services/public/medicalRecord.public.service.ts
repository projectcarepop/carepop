import { supabase } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';

// The duration for which the signed URL will be valid, in seconds.
const SIGNED_URL_EXPIRES_IN = 300; // 5 minutes

export class MedicalRecordPublicService {
    
    /**
     * Finds all medical records for a given user.
     * @param userId The ID of the user whose records to fetch.
     * @returns A list of medical records.
     */
    public async findRecordsByUserId(userId: string) {
        const { data, error } = await supabase
            .from('medical_records')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw new AppError(`Failed to fetch medical records: ${error.message}`, 500);
        }
        return data;
    }

    /**
     * Generates a signed URL for a specific medical record file.
     * @param userId The ID of the user requesting the URL.
     * @param recordId The ID of the medical record.
     * @returns An object containing the signed URL.
     */
    public async createSignedUrl(userId: string, recordId: string) {
        // First, verify the user has access to this record.
        const { data: record, error: recordError } = await supabase
            .from('medical_records')
            .select('storage_object_path')
            .eq('id', recordId)
            .eq('user_id', userId)
            .single();

        if (recordError || !record) {
            throw new AppError('Medical record not found or access denied.', 404);
        }

        const { storage_object_path } = record;

        // Generate the signed URL.
        const { data, error: urlError } = await supabase
            .storage
            .from('medical_records')
            .createSignedUrl(storage_object_path, SIGNED_URL_EXPIRES_IN);

        if (urlError) {
            throw new AppError(`Failed to create signed URL: ${urlError.message}`, 500);
        }

        return { signedUrl: data.signedUrl };
    }
} 