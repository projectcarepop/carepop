import { type MedicalRecordWithRelations } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Stethoscope, Pill, FileText, User, Building, Syringe, Calendar } from 'lucide-react';

interface RecordCardProps {
  record: MedicalRecordWithRelations;
}

// Helper to format the record type for display
const formatRecordType = (type: MedicalRecordWithRelations['recordType']) => {
  switch (type) {
    case 'DOCTOR_NOTE': return { text: "Doctor's Note", icon: <Stethoscope className="h-4 w-4" /> };
    case 'PRESCRIPTION': return { text: 'Prescription', icon: <Pill className="h-4 w-4" /> };
    case 'CLINICAL_DOCUMENT': return { text: 'Clinical Document', icon: <FileText className="h-4 w-4" /> };
    default: return { text: 'Medical Record', icon: <FileText className="h-4 w-4" /> };
  }
};

const RecordDetails = ({ record }: { record: MedicalRecordWithRelations }) => {
    switch (record.recordType) {
        case 'DOCTOR_NOTE':
            const noteDetails = record.details as any; // Cast to access note content
            return <p className="text-sm text-gray-700 whitespace-pre-wrap">{noteDetails?.note}</p>;
        
        case 'PRESCRIPTION':
            const presDetails = record.details as any; // Cast to access prescription fields
            return (
                <div className="text-sm space-y-2">
                    <p><strong className="font-semibold">Medication:</strong> {presDetails?.medication}</p>
                    <p><strong className="font-semibold">Dosage:</strong> {presDetails?.dosage}</p>
                    <p><strong className="font-semibold">Frequency:</strong> {presDetails?.frequency}</p>
                    {presDetails?.notes && <p><strong className="font-semibold">Notes:</strong> {presDetails.notes}</p>}
                </div>
            );
            
        case 'CLINICAL_DOCUMENT':
            const docDetails = record.details as any;
            if (!docDetails) {
                return <p className="text-sm text-gray-500">Document details not available.</p>;
            }
            return (
                <div className="text-sm space-y-2">
                    <p><strong className="font-semibold">Document:</strong> {docDetails.documentName}</p>
                    {docDetails.fileType && <p><strong className="font-semibold">Type:</strong> {docDetails.fileType}</p>}
                    {docDetails.filePath && (
                        <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">File uploaded successfully</p>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault(); // Prevent link navigation
                                    // TODO: Implement download functionality
                                    alert('Download functionality will be implemented');
                                }}
                                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            >
                                <FileText className="h-3 w-3 mr-1" />
                                View Document
                            </button>
                        </div>
                    )}
                </div>
            );
            
        default:
            return <p className="text-sm text-gray-500">Details for this record type are not available.</p>;
    }
};

export default function RecordCard({ record }: RecordCardProps) {
  const { text: recordTypeText, icon: recordTypeIcon } = formatRecordType(record.recordType);

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="bg-gray-50 dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <span className="text-blue-600">{recordTypeIcon}</span>
                <CardTitle className="text-lg font-semibold">{recordTypeText}</CardTitle>
            </div>
            <Badge variant="outline">{format(new Date(record.appointment.appointmentTime), 'PPP')}</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 grid md:grid-cols-2 gap-4 text-sm">
        <div className="space-y-3">
            <div className="flex items-center text-gray-600"><User className="h-4 w-4 mr-2 text-gray-400" /> <strong>Provider:</strong><span className="ml-2">{record.appointment.doctor?.fullName || 'Unknown Provider'}</span></div>
            <div className="flex items-center text-gray-600"><Building className="h-4 w-4 mr-2 text-gray-400" /> <strong>Clinic:</strong><span className="ml-2">{record.appointment.clinic?.name || 'Unknown Clinic'}</span></div>
        </div>
        <div className="space-y-3">
            <div className="flex items-center text-gray-600"><Syringe className="h-4 w-4 mr-2 text-gray-400" /> <strong>Service:</strong><span className="ml-2">{record.appointment.service?.name || 'Unknown Service'}</span></div>
            <div className="flex items-center text-gray-600"><Calendar className="h-4 w-4 mr-2 text-gray-400" /> <strong>Time:</strong><span className="ml-2">{format(new Date(record.appointment.appointmentTime), 'p')}</span></div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 dark:bg-gray-800 p-4">
        <div className="w-full">
            <h4 className="text-xs uppercase font-semibold text-gray-500 mb-2">Record Details</h4>
            <RecordDetails record={record} />
        </div>
      </CardFooter>
    </Card>
  );
}
