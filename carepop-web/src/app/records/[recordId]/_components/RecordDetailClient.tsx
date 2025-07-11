'use client';

import { useState } from 'react';
import { type MedicalRecordWithRelations } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Stethoscope, Pill, FileText, User, Building, Syringe, Calendar, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { downloadMedicalDocument } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';

interface RecordDetailClientProps {
  record: MedicalRecordWithRelations;
  backHref: string;
  backText: string;
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
    const { session } = useAuth();
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (!session?.access_token) {
            alert('Please log in to download documents');
            return;
        }

        setIsDownloading(true);
        try {
            const response = await downloadMedicalDocument(record.id, session.access_token);
            
            // Create a temporary link element and trigger download
            const link = document.createElement('a');
            link.href = response.downloadUrl;
            link.download = response.fileName || 'medical-document';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download document. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

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
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                        <div>
                            <span className="font-medium block">{docDetails.documentName}</span>
                            {docDetails.fileType && <span className="text-sm text-gray-500">{docDetails.fileType}</span>}
                        </div>
                    </div>
                    <Button 
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="min-w-[120px]"
                    >
                        {isDownloading ? (
                            <>
                                <div className="animate-spin h-4 w-4 mr-2 border border-white border-t-transparent rounded-full"></div>
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </>
                        )}
                    </Button>
                </div>
            );
            
        default:
            return <p className="text-sm text-gray-500">Details for this record type are not available.</p>;
    }
};

export default function RecordDetailClient({ record, backHref, backText }: RecordDetailClientProps) {
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