'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { AppointmentTable } from './components/AppointmentTable'; 
import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Clinic {
  id: string;
  name: string;
}

export default function AdminAppointmentsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) throw new Error("Backend URL is not configured.");

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new Error("Not authenticated");
        
        const response = await fetch(`${backendUrl}/api/v1/admin/clinics`, {
            headers: { 'Authorization': `Bearer ${sessionData.session.access_token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch clinics");

        const result = await response.json();

        // The API returns a paginated object like { data: { data: [...] } }
        const clinicsArray = result?.data?.data;

        if (Array.isArray(clinicsArray)) {
          setClinics(clinicsArray);
          if (clinicsArray.length > 0) {
              setSelectedClinicId(clinicsArray[0].id);
          }
        } else {
          console.error("API did not return a valid array of clinics:", result);
          setClinics([]); // Set to an empty array to prevent crash
        }
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    };
    fetchClinics();
  }, [supabase]);

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Appointment Management</h1>
        <Button asChild>
          <Link href="/admin/appointments/new">
             <PlusCircle className="mr-2 h-4 w-4" /> Book New Appointment
          </Link>
        </Button>
      </div>
       <p className="text-muted-foreground">
        View, confirm, and manage all appointments across your clinics.
      </p>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <CardTitle className="text-md whitespace-nowrap">Select Clinic</CardTitle>
            <div className="w-full max-w-sm">
                <Select onValueChange={setSelectedClinicId} value={selectedClinicId || ''}>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a clinic..." />
                    </SelectTrigger>
                    <SelectContent>
                    {clinics.map(clinic => (
                        <SelectItem key={clinic.id} value={clinic.id}>{clinic.name}</SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            {selectedClinicId ? (
                <AppointmentTable clinicId={selectedClinicId} />
            ) : (
                <div className="text-center p-8 text-muted-foreground">
                    {clinics.length > 0 ? "Select a clinic to view appointments." : "No clinics found or loading..."}
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
} 