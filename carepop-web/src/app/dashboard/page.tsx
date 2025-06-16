'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Loader2, UserCircle, Edit3, AlertCircle, HeartPulse, MapPin, Users
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Reusable Section Header Component
const SectionHeader = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </div>
    </div>
);

// Data Point Display Component
const InfoField = ({ label, value }: { label: string; value: ReactNode }) => (
    <div>
        <Label className="text-sm font-medium text-gray-500">{label}</Label>
        <p className="font-sans text-base font-semibold text-gray-800 dark:text-gray-200 mt-1">
            {value ?? <span className="text-sm font-normal italic text-gray-500">Not set</span>}
        </p>
    </div>
);

// PSGC Interface Definitions
interface PsgcItem {
    [key: string]: string;
}
interface Barangay extends PsgcItem { brgy_code: string; brgy_name: string; }
interface CityMunicipality extends PsgcItem { city_code: string; city_name: string; }
interface Province extends PsgcItem { province_code: string; province_name: string; }

export default function DashboardPage() {
  const { user, loading: authLoading, fetchProfile } = useAuth();
  const router = useRouter();

  // State management
  const [isRefetching, setIsRefetching] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState<CityMunicipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [psgcLoading, setPsgcLoading] = useState(true);

  // Authentication and initial profile fetch logic
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && (!user.first_name || !user.last_name) && fetchProfile) {
      setIsRefetching(true);
      fetchProfile().finally(() => setIsRefetching(false));
    }
  }, [authLoading, user, router, fetchProfile]);
  
  // PSGC data fetching
  useEffect(() => {
    const fetchPsgcData = async () => {
      try {
        setPsgcLoading(true);
        const [provRes, cityMunRes, bgyRes] = await Promise.all([
          fetch('/data/psgc/provinces.json'),
          fetch('/data/psgc/cities-municipalities.json'),
          fetch('/data/psgc/barangays.json'),
        ]);
        const provData = await provRes.json();
        const cityMunData = await cityMunRes.json();
        const bgyData = await bgyRes.json();
        setProvinces(Array.isArray(provData) ? provData : []);
        setCitiesMunicipalities(Array.isArray(cityMunData) ? cityMunData : []);
        setBarangays(Array.isArray(bgyData) ? bgyData : []);
      } catch (error) {
        console.error('Error fetching PSGC data:', error);
      } finally {
        setPsgcLoading(false);
      }
    };
    fetchPsgcData();
  }, []);

  // Helper functions
  const getPsgcName = (code: string | null | undefined, collection: PsgcItem[], codeField: string, nameField: string) => {
    if (!code) return null;
    return collection.find(item => item[codeField] === code)?.[nameField] || code;
  };
  const getProvinceName = (code?: string | null) => getPsgcName(code, provinces, 'province_code', 'province_name');
  const getCityName = (code?: string | null) => getPsgcName(code, citiesMunicipalities, 'city_code', 'city_name');
  const getBarangayName = (code?: string | null) => getPsgcName(code, barangays, 'brgy_code', 'brgy_name');
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Loading and Access Denied states
  if (authLoading || psgcLoading || isRefetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Card className="w-full max-w-md text-center p-6 shadow-lg">
                <CardHeader>
                    <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-2" />
                    <CardTitle className="text-2xl">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You must be logged in to view this page.</p>
                    <Button asChild className="mt-6 w-full">
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  const profileComplete = user && user.first_name && user.last_name && user.date_of_birth;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
      <main className="container mx-auto py-10 px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
              Welcome, {user?.first_name || 'User'}!
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Here is your personal dashboard.</p>
          </div>
        </div>

        {/* Incomplete Profile Alert */}
        {!profileComplete && (
            <Card className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
                <CardHeader className="flex flex-row items-center space-x-3">
                    <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    <div>
                        <CardTitle className="text-yellow-800 dark:text-yellow-300">Complete Your Profile</CardTitle>
                        <CardDescription className="text-yellow-700 dark:text-yellow-500">
                        Some essential details are missing. Please update your profile.
                        </CardDescription>
                    </div>
                </CardHeader>
            </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Unified Profile Card */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="shadow-sm border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl font-semibold">Your Profile</CardTitle>
                  <Button asChild>
                    <Link href="/create-profile">
                      <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal & Contact Section */}
                <div className="space-y-6">
                  <SectionHeader 
                    icon={UserCircle} 
                    title="Personal & Contact" 
                    description="Your basic identification and contact details."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoField label="First Name" value={user.first_name} />
                    <InfoField label="Last Name" value={user.last_name} />
                    <InfoField label="Middle Initial" value={user.middle_initial} />
                    <InfoField label="Email Address" value={user.email} />
                    <InfoField label="Contact Number" value={user.contact_no} />
                    <InfoField label="PhilHealth No." value={user.philhealth_no} />
                  </div>
                </div>

                <Separator />

                {/* Demographics Section */}
                <div className="space-y-6">
                  <SectionHeader 
                    icon={Users} 
                    title="Demographics" 
                    description="Details about your personal background."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoField label="Date of Birth" value={formatDate(user.date_of_birth)} />
                    <InfoField label="Age" value={user.age} />
                    <InfoField label="Gender Identity" value={user.gender_identity} />
                    <InfoField label="Pronouns" value={user.pronouns} />
                    <InfoField label="Civil Status" value={user.civil_status} />
                    <InfoField label="Occupation" value={user.occupation} />
                  </div>
                </div>

                <Separator />

                {/* Address Section */}
                <div className="space-y-6">
                  <SectionHeader 
                    icon={MapPin} 
                    title="Address" 
                    description="Your primary residential address."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InfoField label="Street Address" value={user.street} />
                    <InfoField label="Barangay" value={getBarangayName(user.barangay_code)} />
                    <InfoField label="City / Municipality" value={getCityName(user.city_municipality_code)} />
                    <InfoField label="Province" value={getProvinceName(user.province_code)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column: Side Cards */}
          <div className="space-y-8">
            <Card className="shadow-sm border">
              <CardHeader>
                <SectionHeader 
                  icon={HeartPulse} 
                  title="Appointments" 
                  description="View your upcoming and past appointments."
                />
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/dashboard/appointments">Go to My Appointments</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 