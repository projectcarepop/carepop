import { supabase } from '@/config/supabaseClient';
import { AppError } from '@/lib/utils/appError';
import { v4 as uuidv4 } from 'uuid';

export class MedicalRecordAdminService {
    
    public async createMedicalRecord(
        file: Express.Multer.File,
        userId: string,
        recordType: string,
        description?: string,
        clinicId?: string,
        providerId?: string,
        appointmentId?: string
    ) {
        if (!file) {
            throw new AppError('A file is required to create a medical record.', 400);
        }

        const recordId = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const storagePath = `${userId}/${recordId}.${fileExtension}`;

        // 1. Upload the file to the private 'medical_records' bucket
        const { error: uploadError } = await supabase.storage
            .from('medical_records')
            .upload(storagePath, file.buffer, {
                contentType: file.mimetype,
            });

        if (uploadError) {
            throw new AppError(`Failed to upload medical record to storage: ${uploadError.message}`, 500);
        }

        // 2. Create an entry in the medical_records table
        const { data, error: dbError } = await supabase
            .from('medical_records')
            .insert({
                id: recordId,
                user_id: userId,
                record_type: recordType,
                description,
                storage_object_path: storagePath,
                clinic_id: clinicId,
                provider_id: providerId,
                appointment_id: appointmentId,
            })
            .select()
            .single();
        
        if (dbError) {
            // Attempt to clean up the orphaned file in storage if the DB insert fails
            await supabase.storage.from('medical_records').remove([storagePath]);
            throw new AppError(`Failed to create medical record in database: ${dbError.message}`, 500);
        }

        return data;
    }
} 