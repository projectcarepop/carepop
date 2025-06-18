import { supabase as publicSupabase } from '@/config/supabaseClient';
import { serviceSupabase as supabase } from '@/lib/supabase/service-client';
import { AppError } from '@/lib/utils/appError';
import { StatusCodes } from 'http-status-codes';
import { Database } from '@/types/supabase.types';
import logger from '@/utils/logger';

const MEDICAL_RECORDS_BUCKET = 'medical-records';

const ensureBucketExists = async () => {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) throw listError;

    const bucketExists = buckets.some((bucket) => bucket.id === MEDICAL_RECORDS_BUCKET);
    if (!bucketExists) {
      console.log(`Storage bucket '${MEDICAL_RECORDS_BUCKET}' not found. Creating it now.`);
      const { error: createError } = await supabase.storage.createBucket(MEDICAL_RECORDS_BUCKET, {
        public: true,
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
};

export const createRecord = async (userId: string, adminId: string, title: string, details?: string, file?: Express.Multer.File) => {
  let fileUrl: string | undefined = undefined;

  if (file) {
    await ensureBucketExists();

    const filePath = `${userId}/${Date.now()}-${file.originalname}`;
    const { error: uploadError } = await supabase.storage
      .from(MEDICAL_RECORDS_BUCKET)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError);
      throw new AppError('Failed to upload file.', StatusCodes.INTERNAL_SERVER_ERROR);
    }
    
    const { data: { publicUrl } } = supabase.storage.from(MEDICAL_RECORDS_BUCKET).getPublicUrl(filePath);
    fileUrl = publicUrl;
  }

  const { data, error } = await supabase
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
};

export const getRecordsForUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_medical_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError('Failed to fetch medical records', StatusCodes.INTERNAL_SERVER_ERROR);
  }
  return data;
};

export const updateRecord = async (recordId: string, title: string, details?: string) => {
  const { data, error } = await supabase
    .from('user_medical_records')
    .update({ record_title: title, record_details: details, updated_at: new Date().toISOString() })
    .eq('id', recordId)
    .select()
    .single();

  if (error) {
    throw new AppError('Failed to update medical record', StatusCodes.INTERNAL_SERVER_ERROR);
  }
  return data;
};

export const deleteRecord = async (recordId: string) => {
  const { data: record, error: fetchError } = await supabase
    .from('user_medical_records')
    .select('record_file_url')
    .eq('id', recordId)
    .single();

  if (fetchError) {
    throw new AppError('Record not found', StatusCodes.NOT_FOUND);
  }

  if (record.record_file_url) {
    const filePath = new URL(record.record_file_url).pathname.split(`/${MEDICAL_RECORDS_BUCKET}/`)[1];
    const { error: deleteError } = await supabase.storage
      .from(MEDICAL_RECORDS_BUCKET)
      .remove([filePath]);
    
    if (deleteError) {
      console.error('Failed to delete file from storage:', deleteError);
    }
  }

  const { error: dbError } = await supabase
    .from('user_medical_records')
    .delete()
    .eq('id', recordId);

  if (dbError) {
    throw new AppError('Failed to delete medical record from database', StatusCodes.INTERNAL_SERVER_ERROR);
  }

  return { message: 'Record deleted successfully' };
};

export async function getMedicalRecordsByUserId(userId: string, searchTerm?: string) {
    logger.info(`[SERVICE] Fetching medical records for user: ${userId} with term: "${searchTerm}"`);
    try {
        const { data, error } = await supabase
            .rpc('search_medical_records', {
                p_user_id: userId,
                p_search_term: searchTerm || ''
            });

        if (error) {
            logger.error('[SERVICE-ERROR] Supabase RPC returned an error.', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
            });
            throw new AppError(`Supabase error: ${error.message}`, 500);
        }

        logger.info(`[SERVICE] Successfully fetched ${data?.length || 0} medical records.`);
        return data;
    } catch (e: any) {
        logger.error('[SERVICE-CATCH] Caught an exception during medical record fetch.', {
            errorMessage: e.message,
            stack: e.stack,
            fullError: e
        });
        // Re-throw the original error or a new AppError
        throw new AppError('A critical error occurred while fetching medical records.', 500);
    }
} 