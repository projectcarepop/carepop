'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth, Profile } from '@/lib/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Define clinic type based on your backend structure
interface Clinic {
  id: string;
  name: string;
  full_address: string;
  contact_phone: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ProfileWithRole extends Profile {
  role?: string;
}

export default function ClinicsListingPage() {
  const { user, profile: authProfile, isLoading: authLoading, session } = useAuth();
  const profile = authProfile as ProfileWithRole | null;
  
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clinicToDelete, setClinicToDelete] = useState<string | null>(null);

  // Fetch clinics on component mount
  useEffect(() => {
    const fetchClinics = async () => {
      if (!session?.access_token) return;
      
      try {
        const response = await fetch('/api/v1/admin/clinics', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setClinics(Array.isArray(data.data) ? data.data : []);
      } catch (err: unknown) {
        console.error('Error fetching clinics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch clinics');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading && session) {
      fetchClinics();
    }
  }, [session, authLoading]);

  const handleDeleteClinic = async (clinicId: string) => {
    if (!session?.access_token) return;
    
    try {
      const response = await fetch(`/api/v1/admin/clinics/${clinicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Remove the deleted clinic from state
      setClinics(prevClinics => prevClinics.filter(clinic => clinic.id !== clinicId));
      setClinicToDelete(null);
    } catch (err: unknown) {
      console.error('Error deleting clinic:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete clinic');
    }
  };

  if (authLoading) {
    return <p>Loading authentication state...</p>;
  }

  if (!user || !profile || profile.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-2xl font-semibold mb-4">Access Denied</p>
        <p className="mb-8">You must be an administrator to view this page.</p>
        <Link href="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">Clinics</CardTitle>
            <CardDescription>
              Manage clinic locations and information.
            </CardDescription>
          </div>
          <Link href="/admin/clinics/new">
            <Button>Add New Clinic</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <p>Loading clinics...</p>
          ) : clinics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No clinics found. Add your first clinic to get started.</p>
              <Link href="/admin/clinics/new">
                <Button>Add New Clinic</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clinics.map((clinic) => (
                    <TableRow key={clinic.id}>
                      <TableCell className="font-medium">{clinic.name}</TableCell>
                      <TableCell>{clinic.full_address}</TableCell>
                      <TableCell>
                        {clinic.contact_phone && <div>{clinic.contact_phone}</div>}
                        {clinic.contact_email && <div>{clinic.contact_email}</div>}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          clinic.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {clinic.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Link href={`/admin/clinics/${clinic.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Link href={`/admin/clinics/${clinic.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <AlertDialog
                            open={clinicToDelete === clinic.id}
                            onOpenChange={(open) => {
                              if (!open) setClinicToDelete(null);
                            }}
                          >
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => setClinicToDelete(clinic.id)}
                              >
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the clinic
                                  &ldquo;{clinic.name}&rdquo; and all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-700"
                                  onClick={() => handleDeleteClinic(clinic.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 