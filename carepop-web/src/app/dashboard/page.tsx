'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  Loader2, UserCircle, Edit3, AlertCircle, HeartPulse, MapPin, Users, Camera
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ProfileImageUploadModal } from '@/components/ui/ProfileImageUploadModal';

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
  const { user, isLoaded } = useUser();
  const router = useRouter();

  // State management
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState<CityMunicipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [psgcLoading, setPsgcLoading] = useState(true);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  // Authentication check
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in');
    }
  }, [isLoaded, user, router]);
  
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
  if (!isLoaded || psgcLoading) {
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
                        <Link href="/sign-in">Go to Sign In</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
  }
  
  const profileComplete = user.publicMetadata?.profileComplete === true;
  const publicMetadata = user.publicMetadata || {};

  return (
    <>
      <ProfileImageUploadModal isOpen={isUploadModalOpen} onOpenChange={setUploadModalOpen} />
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen font-sans">
        <main className="container mx-auto py-10 px-4 space-y-8">
          
          {/* Header & Profile Image */}
          <div className="flex items-center gap-6">
              <div className="relative flex-shrink-0">
                  <Image
                      src={user.imageUrl}
                      alt="Profile Picture"
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-white dark:border-gray-800 shadow-md"
                  />
                  <Button
                      variant="outline"
                      size="icon"
                      className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 bg-white dark:bg-gray-700"
                      onClick={() => setUploadModalOpen(true)}
                  >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Upload new picture</span>
                  </Button>
              </div>
              <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  Welcome, {user.firstName || 'User'}!
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {profileComplete 
                      ? "Here is your personal dashboard." 
                      : "Please complete your profile to book appointments and access all features."}
                  </p>
              </div>
          </div>

          {/* Incomplete Profile Alert */}
          {!profileComplete && (
              <Card className="bg-amber-50 border-amber-400 dark:bg-amber-900/30 dark:border-amber-700 shadow-lg">
                  <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <div className="flex-grow">
                          <CardTitle className="text-lg font-semibold text-amber-800 dark:text-amber-300">Action Required: Complete Your Profile</CardTitle>
                          <CardDescription className="text-amber-700 dark:text-amber-500 mt-1">
                            To ensure we can provide the best care and to book any services, please provide your essential details.
                          </CardDescription>
                      </div>
                       <Button asChild className="mt-2 sm:mt-0 sm:ml-auto flex-shrink-0">
                          <Link href="/complete-profile">
                              <Edit3 className="mr-2 h-4 w-4" /> Go to Profile Form
                          </Link>
                      </Button>
                  </CardHeader>
              </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Unified Profile Card */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="shadow-sm border">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl font-semibold">Your Profile Details</CardTitle>
                    <Button asChild disabled={!profileComplete}>
                      <Link href="/complete-profile">
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
                      <InfoField label="First Name" value={user.firstName} />
                      <InfoField label="Last Name" value={user.lastName} />
                      <InfoField label="Middle Initial" value={publicMetadata.middle_initial as string} />
                      <InfoField label="Email Address" value={user.emailAddresses[0]?.emailAddress} />
                      <InfoField label="Contact Number" value={publicMetadata.contact_no as string} />
                      <InfoField label="PhilHealth No." value={publicMetadata.philhealth_no as string} />
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
                      <InfoField label="Date of Birth" value={formatDate(publicMetadata.date_of_birth as string)} />
                      <InfoField label="Age" value={publicMetadata.age as number} />
                      <InfoField label="Gender Identity" value={publicMetadata.gender_identity as string} />
                      <InfoField label="Pronouns" value={publicMetadata.pronouns as string} />
                      <InfoField label="Civil Status" value={publicMetadata.civil_status as string} />
                      <InfoField label="Occupation" value={publicMetadata.occupation as string} />
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
                      <InfoField label="Street Address" value={publicMetadata.street as string} />
                      <InfoField label="Barangay" value={getBarangayName(publicMetadata.barangay_code as string)} />
                      <InfoField label="City / Municipality" value={getCityName(publicMetadata.city_municipality_code as string)} />
                      <InfoField label="Province" value={getProvinceName(publicMetadata.province_code as string)} />
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
                    title="Appointments & Services" 
                    description="Book new services and view your appointments."
                  />
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4">
                  <Button asChild className="w-full" disabled={!profileComplete}>
                    <Link href="/book-service">Book a New Service</Link>
                  </Button>
                  <Button asChild className="w-full" variant="secondary">
                    <Link href="/dashboard/appointments">Go to My Appointments</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}