import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getProductCategories } from '@/services/api';
import CategoryClient from './_components/CategoryClient';

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // The API service function will handle the actual fetching
  const initialCategoriesResponse = await getProductCategories(session!.access_token, { page: 1, limit: 10 });
  const initialCategories = initialCategoriesResponse.data;

  return (
    <div className="container mx-auto py-10">
      <CategoryClient initialCategories={initialCategories || []} />
    </div>
  );
} 