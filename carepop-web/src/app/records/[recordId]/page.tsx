import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { type MedicalRecordWithRelations } from '@/lib/types';
import RecordDetailClient from './_components/RecordDetailClient';

interface MedicalRecordDetailPageProps {
  params: {
    recordId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}



export default async function MedicalRecordDetailPage({ params, searchParams }: MedicalRecordDetailPageProps) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/sign-in');
  }

  const { recordId } = params;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = `${API_BASE_URL}/api/me/records/${recordId}`;
  
  const headers = {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
  };
  
  const response = await fetch(url, { headers, cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error('Failed to fetch medical record.');
  }

  const record: MedicalRecordWithRelations = await response.json();

  if (!record) {
    notFound();
  }
  
  const from = searchParams.from;
  const backHref = from === 'dashboard' ? '/main-dashboard' : '/records';
  const backText = from === 'dashboard' ? 'Back to Dashboard' : 'Back to All Records';

  return (
    <RecordDetailClient 
      record={record} 
      backHref={backHref} 
      backText={backText} 
    />
  );
}
