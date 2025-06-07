'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AppointmentTable } from './components/AppointmentTable'; 
import { useState, useEffect, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new Error("Not authenticated");
        
        const response = await fetch('/api/v1/admin/clinics', {
            headers: { 'Authorization': `Bearer ${sessionData.session.access_token}` }
        });
        if (!response.ok) throw new Error("Failed to fetch clinics");

        const result = await response.json();
        setClinics(result.data);
        if (result.data.length > 0) {
            setSelectedClinicId(result.data[0].id); // Default to the first clinic
        }
      } catch (error) {
        console.error("Error fetching clinics:", error);
      }
    };
    fetchClinics();
  }, [supabase]);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin Dashboard
          </Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Appointment Management</h1>
      </div>
      
      <div className="mb-4 flex justify-start">
        <span className="mr-2 text-sm font-medium text-muted-foreground py-2">Clinic:</span>
        <div className="w-64">
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
      
      {selectedClinicId ? (
        <AppointmentTable clinicId={selectedClinicId} />
      ) : (
        <div className="text-center p-8 border rounded-md">
            {clinics.length > 0 ? "Select a clinic to view appointments." : "Loading clinics..."}
        </div>
      )}
    </div>
  );
} 