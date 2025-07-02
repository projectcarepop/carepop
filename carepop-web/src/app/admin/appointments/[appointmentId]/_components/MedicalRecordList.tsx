'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/contexts/auth-context';
import * as api from '@/services/api';
import { type MedicalRecordWithDetails, type Prescription, type DoctorNote, type ClinicalDocument } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Download, FileText, Pill, Stethoscope, UploadCloud } from 'lucide-react';

// --- PROPS ---
interface MedicalRecordListProps {
    initialRecords: MedicalRecordWithDetails[];
    appointmentId: string;
}

// --- ZOD SCHEMAS for FORMS ---
const noteFormSchema = z.object({
    note: z.string().min(10, "Note must be at least 10 characters long."),
});
type NoteFormData = z.infer<typeof noteFormSchema>;

const prescriptionFormSchema = z.object({
    medication: z.string().min(1, "Medication is required."),
    dosage: z.string().optional(),
    frequency: z.string().optional(),
});
type PrescriptionFormData = z.infer<typeof prescriptionFormSchema>;

const documentFormSchema = z.object({
  documentName: z.string().min(3, "Document name is required."),
});
type DocumentFormData = z.infer<typeof documentFormSchema>;

type DocumentUploadPayload = DocumentFormData & { file: File };

// --- SPECIALIZED CARD COMPONENTS ---
const NoteCard = ({ details }: { details: DoctorNote }) => ( <p className="text-sm text-gray-700 whitespace-pre-wrap">{details.note}</p> );
const PrescriptionCard = ({ details }: { details: Prescription }) => (
    <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
        <p><strong>Medication:</strong></p><p>{details.medication}</p>
        {details.dosage && <><p><strong>Dosage:</strong></p><p>{details.dosage}</p></>}
        {details.frequency && <><p><strong>Frequency:</strong></p><p>{details.frequency}</p></>}
    </div>
);
const DocumentCard = ({ details }: { details: ClinicalDocument }) => {
    const { supabase } = useAuth();
    const handleDownload = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.storage.from('medical_documents').createSignedUrl(details.filePath, 60);
        if (error || !data?.signedUrl) {
            console.error("Error creating signed URL:", error);
            alert('Could not get download link.');
            return;
        }
        window.open(data.signedUrl, '_blank');
    };
    return (
        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-md">
            <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-slate-600"/>
                <div>
                    <span className="text-sm font-medium">{details.documentName}</span>
                    {details.fileType && <p className="text-xs text-slate-500">{details.fileType}</p>}
                </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-4 w-4 mr-2" />Download</Button>
        </div>
    );
};

// --- DISPATCHER CARD COMPONENT ---
const MedicalRecordCard = ({ record }: { record: MedicalRecordWithDetails }) => {
    const recordDate = new Date(record.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    const getRecordIcon = () => {
        switch(record.recordType) {
            case 'DOCTOR_NOTE': return <Stethoscope className="h-5 w-5 text-blue-500"/>;
            case 'PRESCRIPTION': return <Pill className="h-5 w-5 text-green-500"/>;
            case 'CLINICAL_DOCUMENT': case 'LAB_RESULT': return <FileText className="h-5 w-5 text-purple-500"/>;
            default: return null;
        }
    };
    const renderDetails = () => {
        if (!record.details) return <p className="text-sm text-red-500 italic">Error: Record details are missing.</p>;
        switch(record.recordType) {
            case 'DOCTOR_NOTE': return <NoteCard details={record.details as DoctorNote}/>;
            case 'PRESCRIPTION': return <PrescriptionCard details={record.details as Prescription}/>;
            case 'CLINICAL_DOCUMENT': case 'LAB_RESULT': return <DocumentCard details={record.details as ClinicalDocument}/>;
            default: return <p className="text-sm italic">Unknown record type.</p>;
        }
    };
    return (
        <div className="p-4 border rounded-md bg-white shadow-sm">
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    {getRecordIcon()}
                    <h3 className="font-semibold capitalize">{record.recordType.replace(/_/g, ' ').toLowerCase()}</h3>
                </div>
                <p className="text-xs text-gray-500">{recordDate}</p>
            </div>
            {renderDetails()}
        </div>
    );
};


// --- MAIN LIST COMPONENT ---
export function MedicalRecordList({ initialRecords, appointmentId }: MedicalRecordListProps) {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = React.useState< 'note' | 'prescription' | 'document' | null>(null);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

    const noteForm = useForm<NoteFormData>({ resolver: zodResolver(noteFormSchema), defaultValues: { note: '' }});
    const prescriptionForm = useForm<PrescriptionFormData>({ resolver: zodResolver(prescriptionFormSchema), defaultValues: { medication: '', dosage: '', frequency: '' }});
    const documentForm = useForm<DocumentFormData>({ resolver: zodResolver(documentFormSchema), defaultValues: { documentName: '' } });

    const { data: records, isLoading: isLoadingRecords } = useQuery({
        queryKey: ['appointmentDetails', appointmentId, 'records'],
        queryFn: async () => {
            if (!session?.access_token) return [];
            const details = await api.getAppointmentDetails(appointmentId, session.access_token);
            return details.medicalRecords || [];
        },
        initialData: initialRecords,
        enabled: !!session,
    });
    
    const onMutationSuccess = () => { queryClient.invalidateQueries({ queryKey: ['appointmentDetails', appointmentId] }); setDialogOpen(null); };
    const onMutationError = (error: Error) => alert(`Failed to save: ${error.message}`);

    const { mutate: addNoteMutate, isPending: isAddingNote } = useMutation({
        mutationFn: (data: NoteFormData) => api.addMedicalRecord(appointmentId, { recordType: 'DOCTOR_NOTE', details: data }, session!.access_token),
        onSuccess: () => { onMutationSuccess(); noteForm.reset(); },
        onError: onMutationError,
    });
    
    const { mutate: addPrescriptionMutate, isPending: isAddingPrescription } = useMutation({
        mutationFn: (data: PrescriptionFormData) => api.addMedicalRecord(appointmentId, { recordType: 'PRESCRIPTION', details: data }, session!.access_token),
        onSuccess: () => { onMutationSuccess(); prescriptionForm.reset(); },
        onError: onMutationError,
    });

    const { mutate: uploadDocMutate, isPending: isUploadingDoc } = useMutation({
        mutationFn: (data: DocumentUploadPayload) => api.uploadDocument(appointmentId, data.documentName, data.file, session!.access_token),
        onSuccess: (newlyCreatedRecord) => {
            // Optimistically update the UI without a full refetch
            queryClient.setQueryData(
                ['appointmentDetails', appointmentId, 'records'],
                (oldRecords: MedicalRecordWithDetails[] | undefined) => {
                    // The API returns the full record object inside a 'data' property
                    const newRecord = newlyCreatedRecord.data;
                    if (oldRecords) {
                        return [...oldRecords, newRecord];
                    }
                    return [newRecord];
                }
            );
            
            // Still invalidate in the background to ensure data consistency with the server
            queryClient.invalidateQueries({ queryKey: ['appointmentDetails', appointmentId] });

            // Reset form and close dialog
            documentForm.reset(); 
            setSelectedFile(null);
            setDialogOpen(null);
        },
        onError: onMutationError,
    });
    
    const handleNoteSubmit = (data: NoteFormData) => addNoteMutate(data);
    const handlePrescriptionSubmit = (data: PrescriptionFormData) => addPrescriptionMutate(data);
    const handleDocumentSubmit = (data: DocumentFormData) => {
        if (!selectedFile) { alert("Please select a file to upload."); return; }
        uploadDocMutate({ ...data, file: selectedFile });
    };
    
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Medical Records</h2>
                <div className="flex gap-2">
                    {/* Add Note Dialog */}
                    <Dialog open={dialogOpen === 'note'} onOpenChange={(open) => setDialogOpen(open ? 'note' : null)}>
                        <DialogTrigger asChild><Button variant="outline" size="sm"><Stethoscope className="h-4 w-4 mr-2" />Add Note</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Doctor&apos;s Note</DialogTitle><DialogDescription className="sr-only">Enter clinical notes.</DialogDescription></DialogHeader>
                            <Form {...noteForm}><form onSubmit={noteForm.handleSubmit(handleNoteSubmit)} className="space-y-4">
                                <FormField control={noteForm.control} name="note" render={({ field }) => (<FormItem><FormLabel>Note</FormLabel><FormControl><Textarea {...field} rows={5}/></FormControl><FormMessage /></FormItem>)}/>
                                <DialogFooter><Button type="submit" disabled={isAddingNote}>{isAddingNote ? 'Saving...' : 'Save'}</Button></DialogFooter>
                            </form></Form>
                        </DialogContent>
                    </Dialog>
                    {/* Add Prescription Dialog */}
                    <Dialog open={dialogOpen === 'prescription'} onOpenChange={(open) => setDialogOpen(open ? 'prescription' : null)}>
                        <DialogTrigger asChild><Button variant="outline" size="sm"><Pill className="h-4 w-4 mr-2"/>Add Prescription</Button></DialogTrigger>
                        <DialogContent>
                            <DialogHeader><DialogTitle>Add Prescription</DialogTitle><DialogDescription className="sr-only">Enter prescription details.</DialogDescription></DialogHeader>
                            <Form {...prescriptionForm}><form onSubmit={prescriptionForm.handleSubmit(handlePrescriptionSubmit)} className="space-y-4">
                                <FormField control={prescriptionForm.control} name="medication" render={({ field }) => (<FormItem><FormLabel>Medication</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={prescriptionForm.control} name="dosage" render={({ field }) => (<FormItem><FormLabel>Dosage</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <FormField control={prescriptionForm.control} name="frequency" render={({ field }) => (<FormItem><FormLabel>Frequency</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}/>
                                <DialogFooter><Button type="submit" disabled={isAddingPrescription}>{isAddingPrescription ? 'Saving...' : 'Save'}</Button></DialogFooter>
                            </form></Form>
                        </DialogContent>
                    </Dialog>
                    {/* Upload Document Dialog */}
                    <Dialog open={dialogOpen === 'document'} onOpenChange={(open) => setDialogOpen(open ? 'document' : null)}>
                        <DialogTrigger asChild><Button variant="default" size="sm"><UploadCloud className="h-4 w-4 mr-2"/>Upload Document</Button></DialogTrigger>
                        <DialogContent>
                             <DialogHeader><DialogTitle>Upload Document</DialogTitle><DialogDescription className="sr-only">Upload a new document.</DialogDescription></DialogHeader>
                            <Form {...documentForm}><form onSubmit={documentForm.handleSubmit(handleDocumentSubmit)} className="space-y-4">
                                <FormField control={documentForm.control} name="documentName" render={({ field }) => (<FormItem><FormLabel>Document Name</FormLabel><FormControl><Input {...field} placeholder="e.g., Lab Results" /></FormControl><FormMessage /></FormItem>)}/>
                                <FormItem><FormLabel>File</FormLabel><FormControl><Input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}/></FormControl><FormMessage /></FormItem>
                                <DialogFooter><Button type="submit" disabled={isUploadingDoc}>{isUploadingDoc ? 'Uploading...' : 'Upload'}</Button></DialogFooter>
                            </form></Form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <div className="space-y-4">
                {isLoadingRecords ? <p>Loading records...</p> : records && records.length > 0 ? (
                    records.map((record: MedicalRecordWithDetails) => <MedicalRecordCard key={record.id} record={record} />)
                ) : (
                    <div className="text-center py-10 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500">No medical records found.</p>
                        <p className="text-sm text-gray-400">Add a note, prescription, or document to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}