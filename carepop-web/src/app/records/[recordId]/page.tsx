import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { type MedicalRecordWithRelations } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Stethoscope, Pill, FileText, User, Building, Syringe, Calendar, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MedicalRecordDetailPageProps {
  params: {
    recordId: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

const formatRecordType = (type: MedicalRecordWithRelations['recordType']) => {
  switch (type) {
    case 'DOCTOR_NOTE': return { text: "Doctor's Note", icon: <Stethoscope className="h-5 w-5" /> };
    case 'PRESCRIPTION': return { text: 'Prescription', icon: <Pill className="h-5 w-5" /> };
    case 'CLINICAL_DOCUMENT': return { text: 'Clinical Document', icon: <FileText className="h-5 w-5" /> };
    default: return { text: 'Medical Record', icon: <FileText className="h-5 w-5" /> };
  }
};

const RecordDetailsContent = ({ record }: { record: MedicalRecordWithRelations }) => {
    switch (record.recordType) {
        case 'DOCTOR_NOTE':
            const noteDetails = record.details as any;
            return <p className="text-gray-700 whitespace-pre-wrap">{noteDetails?.note || 'No note content available.'}</p>;
        
        case 'PRESCRIPTION':
            const presDetails = record.details as any;
            if (!presDetails) return <p>No prescription details available.</p>;
            return (
                <div className="text-sm space-y-2 text-gray-800">
                    <p><strong className="font-semibold text-gray-600">Medication:</strong> {presDetails.medication}</p>
                    <p><strong className="font-semibold text-gray-600">Dosage:</strong> {presDetails.dosage}</p>
                    <p><strong className="font-semibold text-gray-600">Frequency:</strong> {presDetails.frequency}</p>
                    {presDetails.notes && <p><strong className="font-semibold text-gray-600">Notes:</strong> {presDetails.notes}</p>}
                </div>
            );
            
        case 'CLINICAL_DOCUMENT':
            const docDetails = record.details as any;
            if (!docDetails) return <p>No document details available.</p>;
            return (
                <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                        <span className="font-medium">{docDetails.documentName}</span>
                    </div>
                    {/* In a real app, this would trigger a secure download via a server action or API route */}
                    <Button><Download className="mr-2 h-4 w-4" /> Download</Button>
                </div>
            );
            
        default:
            return <p className="text-sm text-gray-500">Details for this record type are not available.</p>;
    }
};

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

  const { text: recordTypeText, icon: recordTypeIcon } = formatRecordType(record.recordType);

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href={backHref}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backText}
          </Link>
        </Button>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-blue-600">{recordTypeIcon}</span>
              <CardTitle className="text-2xl font-bold">{recordTypeText}</CardTitle>
            </div>
            <Badge variant="secondary" className="text-base">{format(new Date(record.appointment.appointmentTime), 'PPP')}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                <div className="flex items-center text-gray-700"><User className="h-5 w-5 mr-3 text-gray-400" /> <strong>Provider:</strong><span className="ml-2">{record.appointment.doctor?.fullName || 'Unknown Provider'}</span></div>
                <div className="flex items-center text-gray-700"><Building className="h-5 w-5 mr-3 text-gray-400" /> <strong>Clinic:</strong><span className="ml-2">{record.appointment.clinic?.name || 'Unknown Clinic'}</span></div>
                <div className="flex items-center text-gray-700"><Syringe className="h-5 w-5 mr-3 text-gray-400" /> <strong>Service:</strong><span className="ml-2">{record.appointment.service?.name || 'Unknown Service'}</span></div>
                <div className="flex items-center text-gray-700"><Calendar className="h-5 w-5 mr-3 text-gray-400" /> <strong>Time:</strong><span className="ml-2">{format(new Date(record.appointment.appointmentTime), 'p')}</span></div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Record Details</h3>
                <div className="prose max-w-none">
                    <RecordDetailsContent record={record} />
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
