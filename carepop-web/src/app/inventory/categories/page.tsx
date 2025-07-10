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

  // Handle missing session gracefully
  let initialCategories: any[] = [];
  
  if (session?.access_token) {
    try {
      const initialCategoriesResponse = await getProductCategories(session.access_token, { page: 1, limit: 10 });
      initialCategories = Array.isArray(initialCategoriesResponse?.data) ? initialCategoriesResponse.data : [];
    } catch (error) {
      console.error('Failed to fetch initial categories on server:', error);
      // Categories will be loaded client-side instead
      initialCategories = [];
    }
  }

  return (
    <div className="container mx-auto py-10">
      <CategoryClient initialCategories={initialCategories} />
    </div>
  );
} 