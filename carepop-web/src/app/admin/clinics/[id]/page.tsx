'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth, Profile } from '@/lib/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

// Define a more detailed clinic type based on your backend structure
interface Clinic {
  id: string;
  name: string;
  full_address: string;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  operating_hours: Record<string, string> | null;
  is_active: boolean;
  fpop_chapter_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileWithRole extends Profile {
  role?: string;
}

export default function ClinicDetailsPage({ params }: { params: { id: string } }) {
  const { user, profile: authProfile, isLoading: authLoading, session } = useAuth();
  const profile = authProfile as ProfileWithRole | null;
  
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch clinic details on component mount
  useEffect(() => {
    const fetchClinicDetails = async () => {
      if (!session?.access_token) return;
      
      try {
        const response = await fetch(`/api/v1/admin/clinics/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setClinic(data);
      } catch (err: unknown) {
        console.error('Error fetching clinic details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch clinic details');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading && session) {
      fetchClinicDetails();
    }
  }, [params.id, session, authLoading]);

  const handleDeleteClinic = async () => {
    if (!session?.access_token) return;
    
    try {
      const response = await fetch(`/api/v1/admin/clinics/${params.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Redirect to clinics list after successful deletion
      window.location.href = '/admin/clinics';
    } catch (err: unknown) {
      console.error('Error deleting clinic:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete clinic');
      setIsDeleteDialogOpen(false);
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

  if (isLoading) {
    return <p className="container mx-auto py-8">Loading clinic details...</p>;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          {error}
        </div>
        <Link href="/admin/clinics">
          <Button>Back to Clinics</Button>
        </Link>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="container mx-auto py-8">
        <p>Clinic not found.</p>
        <Link href="/admin/clinics">
          <Button className="mt-4">Back to Clinics</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl">{clinic.name}</CardTitle>
            <CardDescription>
              Clinic details and information
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Link href={`/admin/clinics/${clinic.id}/edit`}>
              <Button variant="outline">Edit</Button>
            </Link>
            <AlertDialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
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
                    onClick={handleDeleteClinic}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Basic Information</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      clinic.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {clinic.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Address</p>
                  <p>{clinic.full_address}</p>
                </div>
                
                {(clinic.latitude !== null && clinic.longitude !== null) && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Coordinates</p>
                    <p>Latitude: {clinic.latitude}, Longitude: {clinic.longitude}</p>
                  </div>
                )}
                
                {clinic.fpop_chapter_id && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">FPOP Chapter ID</p>
                    <p>{clinic.fpop_chapter_id}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Contact Information</h3>
              <Separator className="mb-4" />
              
              <div className="space-y-3">
                {clinic.contact_phone && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone</p>
                    <p>{clinic.contact_phone}</p>
                  </div>
                )}
                
                {clinic.contact_email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{clinic.contact_email}</p>
                  </div>
                )}
                
                {clinic.website && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Website</p>
                    <p>
                      <a 
                        href={clinic.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {clinic.website}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {clinic.operating_hours && (
            <div>
              <h3 className="text-lg font-medium mb-2">Operating Hours</h3>
              <Separator className="mb-4" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(clinic.operating_hours).map(([day, hours]) => (
                  <div key={day} className="p-2 border rounded">
                    <p className="text-sm font-medium">{day}</p>
                    <p>{hours}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {clinic.notes && (
            <div>
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              <Separator className="mb-4" />
              <p className="whitespace-pre-wrap">{clinic.notes}</p>
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-medium mb-2">System Information</h3>
            <Separator className="mb-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clinic ID</p>
                <p className="font-mono text-sm">{clinic.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p>{new Date(clinic.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p>{new Date(clinic.updated_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Link href="/admin/clinics">
            <Button variant="outline">Back to Clinics</Button>
          </Link>
          <Link href={`/admin/clinics/${clinic.id}/edit`}>
            <Button>Edit Clinic</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 