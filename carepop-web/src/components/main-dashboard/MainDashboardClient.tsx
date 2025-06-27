'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getMyAppointments, getMyMedicalRecords } from '@/services/api';
import { useSupabase } from '@/lib/contexts/auth-context';
import type { Profile, Appointment, MedicalRecord } from '@/lib/types';
import { AppointmentsTable } from './AppointmentsTable';
import { Book, FileText, Calendar, LogOut, ArrowRight, Loader2 } from 'lucide-react';
import { signOutAction } from '@/app/main-dashboard/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';

// Helper to display profile details
const ProfileDetail = ({ label, value }: { label: string, value: string | null | undefined }) => {
    if (!value) return null;
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
};

interface MainDashboardClientProps {
  profile: Profile | null;
  initialAppointments: Appointment[];
  initialMedicalRecords: MedicalRecord[];
}

export function MainDashboardClient({ 
  profile, 
  initialAppointments,
  initialMedicalRecords
}: MainDashboardClientProps) {
  const { isInitialized, session } = useSupabase();

  // The queries are now enabled only when the auth context is initialized AND there's a session.
  const { data: appointments, isLoading: isLoadingAppointments } = useQuery({
    queryKey: ['myAppointments', session?.user?.id],
    queryFn: () => getMyAppointments(),
    initialData: initialAppointments,
    enabled: isInitialized && !!session,
  });

  const { data: medicalRecords, isLoading: isLoadingRecords } = useQuery({
    queryKey: ['myMedicalRecords', session?.user?.id],
    queryFn: () => getMyMedicalRecords(),
    initialData: initialMedicalRecords,
    enabled: isInitialized && !!session,
  });

  // Display a loading spinner until the initial auth check is complete.
  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    // This case should ideally be handled by the server component redirect,
    // but it's good practice to have a fallback.
    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-center">
            <p>Could not load user profile. Please try signing in again.</p>
            <Button asChild className="mt-4">
                <Link href="/sign-in">Sign In</Link>
            </Button>
        </div>
    );
  }

  const userInitials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.firstName}!</h1>
          <p className="text-muted-foreground">Here&apos;s a summary of your health activities.</p>
        </div>
        <form action={signOutAction}>
            <Button type="submit" variant="outline">
                <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
        </form>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        {/* ENHANCED Profile Summary Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-2 border-primary/50">
                <AvatarImage src={profile.avatarUrl || ''} alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-3xl">{userInitials}</AvatarFallback>
            </Avatar>
            <CardTitle>{profile.firstName} {profile.lastName}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2">Personal Details</h4>
                <ProfileDetail label="Birthday" value={profile.birthday ? format(new Date(profile.birthday), 'MMMM d, yyyy') : null} />
                <ProfileDetail label="Civil Status" value={profile.civilStatus} />
                <ProfileDetail label="Contact No." value={profile.contactNo} />
            </div>
            <div className="space-y-2 rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2">Identity</h4>
                <ProfileDetail label="Gender" value={profile.genderIdentity} />
                <ProfileDetail label="Pronouns" value={profile.pronouns} />
            </div>
             <div className="space-y-2 rounded-lg border p-3">
                <h4 className="text-sm font-semibold mb-2">Other Info</h4>
                <ProfileDetail label="Occupation" value={profile.occupation} />
                <ProfileDetail label="PhilHealth No." value={profile.philhealthNo} />
            </div>
            <Button variant="outline" size="sm" asChild className="w-full">
              <Link href="/create-profile?mode=edit">View & Edit Full Profile</Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Quick Actions moved into the grid */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary"/> Upcoming Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingAppointments ? (
                            <p className="text-lg text-muted-foreground">Loading...</p>
                        ) : (
                            <>
                                <p className="text-3xl font-bold">{appointments?.length || 0}</p>
                                <CardDescription>appointments scheduled</CardDescription>
                            </>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary"/> Medical Records</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingRecords ? (
                            <p className="text-lg text-muted-foreground">Loading...</p>
                        ) : (
                            <>
                                <p className="text-3xl font-bold">{medicalRecords?.length || 0}</p>
                                <CardDescription>total records found</CardDescription>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Book className="h-5 w-5 text-primary"/> Book an Appointment</CardTitle>
                    <CardDescription>Find a provider and schedule your next visit with ease.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/book-appointment">Find a Service</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
      
      {/* Appointments Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Your Upcoming Appointments</CardTitle>
                <CardDescription>A summary of your next few scheduled visits.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/appointments">View All <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
        </CardHeader>
        <CardContent>
            <AppointmentsTable appointments={appointments?.slice(0, 3) || []} />
        </CardContent>
      </Card>
      
      {/* Medical Records Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Your Recent Medical Records</CardTitle>
                <CardDescription>Your latest documents and notes from providers.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
                <Link href="/records">View All Records <ArrowRight className="ml-2 h-4 w-4"/></Link>
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
            {medicalRecords && medicalRecords.length > 0 ? (
                medicalRecords.slice(0, 3).map((record: MedicalRecord) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground"/>
                            <div>
                                <p className="font-semibold capitalize">{record.recordType?.replace(/_/g, ' ').toLowerCase() || 'Record'}</p>
                                <p className="text-sm text-muted-foreground">
                                    Created on {new Date(record.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                             <Link href={`/records/${record.id}`}>View Details</Link>
                        </Button>
                    </div>
                ))
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No medical records found.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
} 