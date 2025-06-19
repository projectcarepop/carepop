"use server";

import { revalidateTag } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getAuthToken } from '@/lib/utils/auth';
import { API_BASE_URL } from '@/lib/config';
import { Database } from '@/types/supabase'; // Import the main DB type
// ... existing code ... 