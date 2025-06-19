'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { IAppointmentReport } from '@/lib/types/appointment-report.interface';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import apiClient from '@/lib/apiClient'; // Import the centralized client

export default function AppointmentReportPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string;

  const [report, setReport] = useState<Partial<IAppointmentReport>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!appointmentId) return;

      setIsLoading(true);

      try {
        const response = await apiClient.get(`/api/v1/admin/appointments/${appointmentId}/report`);
        setReport(response.data.data || { appointment_id: appointmentId });
      } catch (err: any) {
        if (err.response && err.response.status === 404) {
          // No existing report, initialize a new one
          setReport({ appointment_id: appointmentId });
        } else {
          toast.error(err.message || 'An unknown error occurred while fetching the report.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [appointmentId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReport(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!appointmentId) return;
    setIsSaving(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, created_at, updated_at, ...payload } = report;
      payload.appointment_id = appointmentId;

      let response;
      if (id) {
        // Update existing report
        response = await apiClient.put(`/api/v1/admin/reports/${id}`, payload);
      } else {
        // Create new report
        response = await apiClient.post('/api/v1/admin/reports', payload);
      }

      if (response.status === 200 || response.status === 201) {
        toast.success("Report saved successfully.");
        router.back();
      } else {
        throw new Error('Failed to save report.');
      }

    } catch (err: any) {
      console.error("Failed to save report:", err);
      const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (name: keyof IAppointmentReport, label: string, placeholder = '') => (
    <div>
      <Label htmlFor={name} className="font-semibold">{label}</Label>
      <Input
        id={name} name={name}
        value={(report[name] as string) || ''}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  );

  const renderTextarea = (name: keyof IAppointmentReport, label: string) => (
    <div>
      <Label htmlFor={name} className="font-semibold">{label}</Label>
      <Textarea
        id={name} name={name}
        value={(report[name] as string) || ''}
        onChange={handleInputChange}
        rows={4}
        className="mt-1"
      />
    </div>
  );
  
  if (isLoading) {
    return (
        <div className="container mx-auto py-10">
          <div className="flex justify-between items-center mb-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-6 border rounded-lg space-y-6">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="p-6 border rounded-lg space-y-6">
                <Skeleton className="h-6 w-1/4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" asChild>
          <Link href={`/admin/appointments`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Appointments
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Appointment Report</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Report'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doctor&apos;s Notes & Findings</CardTitle>
          <CardDescription>
            Document the purpose, discussions, findings, and next steps for this appointment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <div className="p-6 border rounded-lg space-y-6">
            <h3 className="font-semibold text-xl border-b pb-3">Purpose of Visit</h3>
            {renderInput('purpose_of_visit', 'Purpose', 'e.g., Routine check-up, new symptoms')}
            {renderTextarea('symptoms_reported', 'Symptoms Reported')}
          </div>
          
          <div className="p-6 border rounded-lg space-y-6">
            <h3 className="font-semibold text-xl border-b pb-3">Vitals / Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderInput('vitals_blood_pressure', 'Blood Pressure', 'e.g., 120/80')}
              {renderInput('vitals_temperature', 'Temperature', 'e.g., 98.6°F')}
              {renderInput('vitals_weight', 'Weight', 'e.g., 150 lbs')}
              {renderInput('vitals_height', 'Height', 'e.g., 5&apos; 9"')}
            </div>
            {renderTextarea('vitals_other', 'Other Vitals')}
          </div>

          <div className="p-6 border rounded-lg space-y-6">
            <h3 className="font-semibold text-xl border-b pb-3">Medical Findings</h3>
            {renderTextarea('findings_summary', 'Exam Summary')}
            {renderTextarea('diagnoses', 'Diagnoses')}
          </div>

          <div className="p-6 border rounded-lg space-y-6">
            <h3 className="font-semibold text-xl border-b pb-3">Doctor&apos;s Recommendations</h3>
            {renderTextarea('recommendations_summary', 'Doctor&apos;s Explanation')}
            {renderTextarea('treatment_plan', 'Treatment Plan')}
            {renderTextarea('lifestyle_recommendations', 'Lifestyle/Diet')}
            {renderTextarea('medications_prescribed', 'Medications')}
          </div>

          <div className="p-6 border rounded-lg space-y-6">
            <h3 className="font-semibold text-xl border-b pb-3">Tests & Referrals</h3>
            {renderTextarea('tests_ordered', 'Tests Ordered')}
            {renderTextarea('referrals', 'Referrals')}
          </div>

          <div className="p-6 border rounded-lg space-y-6">
            <h3 className="font-semibold text-xl border-b pb-3">Follow-Up</h3>
            {renderInput('follow_up_date', 'Next Appointment', 'e.g., YYYY-MM-DD')}
            {renderTextarea('follow_up_notes', 'Follow-Up Notes')}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}