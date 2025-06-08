import { SupabaseClient } from '@supabase/supabase-js';
import { AppError } from '../../utils/errors';
import { StatusCodes } from 'http-status-codes';

const MEDICAL_RECORDS_BUCKET = 'medical-records';

export class MedicalRecordAdminService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async createRecord(userId: string, adminId: string, title: string, details?: string, file?: Express.Multer.File) {
    let fileUrl: string | undefined = undefined;

    if (file) {
      // Step 1: Defensively ensure the bucket exists.
      try {
        const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
        if (listError) throw listError;

        const bucketExists = buckets.some((bucket) => bucket.id === MEDICAL_RECORDS_BUCKET);
        if (!bucketExists) {
          console.log(`Storage bucket '${MEDICAL_RECORDS_BUCKET}' not found. Creating it now.`);
          const { error: createError } = await this.supabase.storage.createBucket(MEDICAL_RECORDS_BUCKET, {
            public: true, // public: true is required for .getPublicUrl() to work.
          });
          if (createError) {
            console.error('Fatal: Could not create storage bucket.', createError);
            throw new AppError('Could not create storage bucket.', StatusCodes.INTERNAL_SERVER_ERROR);
          }
        }
      } catch (error) {
          console.error("An unexpected error occurred during bucket check/creation:", error);
          throw new AppError('An unexpected error occurred with storage configuration.', StatusCodes.INTERNAL_SERVER_ERROR);
      }

      // Step 2: Attempt to upload the file, now with detailed error logging.
      const filePath = `${userId}/${Date.now()}-${file.originalname}`;
      const { error: uploadError } = await this.supabase.storage
        .from(MEDICAL_RECORDS_BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        // This is the crucial log that will tell us the true cause if it's not the bucket.
        console.error('Supabase storage upload error:', uploadError);
        throw new AppError('Failed to upload file.', StatusCodes.INTERNAL_SERVER_ERROR);
      }
      
      const { data: { publicUrl } } = this.supabase.storage.from(MEDICAL_RECORDS_BUCKET).getPublicUrl(filePath);
      fileUrl = publicUrl;
    }

    const { data, error } = await this.supabase
      .from('user_medical_records')
      .insert({
        user_id: userId,
        created_by_admin_id: adminId,
        record_title: title,
        record_details: details,
        record_file_url: fileUrl,
      })
      .select()
      .single();
    
    if (error) {
      // TODO: If db insert fails after file upload, we should delete the uploaded file.
      throw new AppError('Failed to create medical record', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return data;
  }

  async getRecordsForUser(userId: string) {
    const { data, error } = await this.supabase
      .from('user_medical_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch medical records', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    return data;
  }

  async updateRecord(recordId: string, title: string, details?: string) {
    const { data, error } = await this.supabase
      .from('user_medical_records')
      .update({ record_title: title, record_details: details, updated_at: new Date() })
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update medical record', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    return data;
  }

  async deleteRecord(recordId: string) {
    // First, get the record to find the file URL
    const { data: record, error: fetchError } = await this.supabase
      .from('user_medical_records')
      .select('record_file_url')
      .eq('id', recordId)
      .single();

    if (fetchError) {
      throw new AppError('Record not found', StatusCodes.NOT_FOUND);
    }

    // If a file exists, delete it from storage
    if (record.record_file_url) {
      const filePath = new URL(record.record_file_url).pathname.split(`/${MEDICAL_RECORDS_BUCKET}/`)[1];
      const { error: deleteError } = await this.supabase.storage
        .from(MEDICAL_RECORDS_BUCKET)
        .remove([filePath]);
      
      if (deleteError) {
        // Log the error but proceed to delete the DB record anyway
        console.error('Failed to delete file from storage:', deleteError);
      }
    }

    // Finally, delete the database record
    const { error: dbError } = await this.supabase
      .from('user_medical_records')
      .delete()
      .eq('id', recordId);

    if (dbError) {
      throw new AppError('Failed to delete medical record from database', StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return { message: 'Record deleted successfully' };
  }
} 