import { redirect } from 'next/navigation';
import React from 'react';
import { cookies } from 'next/headers';

import AdminSidebar from '@/app/admin/_components/AdminSideBar';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.app_metadata.role !== 'admin') {
    redirect('/forbidden');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
