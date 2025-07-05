import React from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getProductCategories } from '@/services/api';
import CategoryClient from './_components/CategoryClient';

export default async function CategoriesPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // The API service function will handle the actual fetching
  const { data: initialCategories } = await getProductCategories(session!.access_token);

  return (
    <div className="container mx-auto py-10">
      <CategoryClient initialCategories={initialCategories || []} />
    </div>
  );
} 