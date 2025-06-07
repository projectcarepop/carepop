'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Loader2, UserCircle, Edit3, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';

// Define AddressSelectItem and Barangay types (can be moved to a shared types file later)
// interface AddressSelectItem { // Removed as it's not used on this page
// value: string;
// label: string;
// }

interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  province_code: string;
  // Add other fields if necessary from your JSON structure, e.g., region_code
}
interface CityMunicipality {
    city_code: string;
    city_name: string;
    province_code: string;
    // Add other fields if necessary
}
interface Province {
    province_code: string;
    province_name: string;
    // Add other fields if necessary
}

export default function DashboardPage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // State for PSGC data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [citiesMunicipalities, setCitiesMunicipalities] = useState<CityMunicipality[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [psgcLoading, setPsgcLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch PSGC data on mount
  useEffect(() => {
    const fetchPsgcData = async () => {
      try {
        setPsgcLoading(true);
        const [provRes, cityMunRes, bgyRes] = await Promise.all([
          fetch('/data/psgc/provinces.json'),
          fetch('/data/psgc/cities-municipalities.json'),
          fetch('/data/psgc/barangays.json'),
        ]);

        if (!provRes.ok || !cityMunRes.ok || !bgyRes.ok) {
          console.error('Failed to fetch PSGC data');
          // Handle error appropriately, maybe set an error state
          return;
        }

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

  // Helper functions to get names from codes
  const getProvinceName = (code?: string) => {
    if (!code) return 'N/A';
    return provinces.find(p => p.province_code === code)?.province_name || code;
  };

  const getCityMunicipalityName = (code?: string) => {
    if (!code) return 'N/A';
    return citiesMunicipalities.find(c => c.city_code === code)?.city_name || code;
  };

  const getBarangayName = (code?: string) => {
    if (!code) return 'N/A';
    return barangays.find(b => b.brgy_code === code)?.brgy_name || code;
  };

  if (authLoading || psgcLoading) {
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

  const profileComplete = profile && profile.firstName && profile.lastName && profile.dateOfBirth;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Welcome, {profile?.firstName || user.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground">This is your personal dashboard.</p>
        </div>
      </div>

      {!profileComplete && (
        <Card className="bg-yellow-50 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700">
          <CardHeader className="flex flex-row items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            <div>
                <CardTitle className="text-yellow-800 dark:text-yellow-300">Complete Your Profile</CardTitle>
                <CardDescription className="text-yellow-700 dark:text-yellow-500">
                Some of your essential profile details are missing.
                </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700 dark:text-yellow-500 mb-4">
              Please complete your profile to get the most out of CarePoP.
            </p>
            <Button asChild variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Link href="/create-profile">
                <UserCircle className="mr-2 h-4 w-4" /> Go to Profile Setup
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-2xl">Your Profile</CardTitle>
            <Button asChild variant="outline">
              <Link href="/create-profile">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email Address</Label>
                <p id="email" className="text-lg">{user.email}</p>
              </div>
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">First Name</Label>
                <p id="firstName" className="text-lg">{profile?.firstName || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">Last Name</Label>
                <p id="lastName" className="text-lg">{profile?.lastName || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="middleInitial" className="text-sm font-medium text-muted-foreground">Middle Initial</Label>
                <p id="middleInitial" className="text-lg">{profile?.middleInitial || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="dob" className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                <p id="dob" className="text-lg">{profile?.dateOfBirth ? new Date(profile.dateOfBirth + 'T00:00:00').toLocaleDateString() : <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
               <div>
                <Label htmlFor="age" className="text-sm font-medium text-muted-foreground">Age</Label>
                <p id="age" className="text-lg">{profile?.age !== undefined && profile.age !== null ? profile.age : <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="genderIdentity" className="text-sm font-medium text-muted-foreground">Gender Identity</Label>
                <p id="genderIdentity" className="text-lg">{profile?.genderIdentity || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="pronouns" className="text-sm font-medium text-muted-foreground">Pronouns</Label>
                <p id="pronouns" className="text-lg">{profile?.pronouns || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="assignedSexAtBirth" className="text-sm font-medium text-muted-foreground">Assigned Sex at Birth</Label>
                <p id="assignedSexAtBirth" className="text-lg">{profile?.assignedSexAtBirth || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="civilStatus" className="text-sm font-medium text-muted-foreground">Civil Status</Label>
                <p id="civilStatus" className="text-lg">{profile?.civilStatus || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="religion" className="text-sm font-medium text-muted-foreground">Religion</Label>
                <p id="religion" className="text-lg">{profile?.religion || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="occupation" className="text-sm font-medium text-muted-foreground">Occupation</Label>
                <p id="occupation" className="text-lg">{profile?.occupation || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
               <div>
                <Label htmlFor="contactNo" className="text-sm font-medium text-muted-foreground">Contact Number</Label>
                <p id="contactNo" className="text-lg">{profile?.contactNo || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                <Label htmlFor="philhealthNo" className="text-sm font-medium text-muted-foreground">PhilHealth No.</Label>
                <p id="philhealthNo" className="text-lg">{profile?.philhealthNo || <span className='text-muted-foreground italic'>Not set</span>}</p>
              </div>
              <div>
                  <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p id="address" className="text-lg">
                      {profile?.street || 'N/A'}, {getBarangayName(profile?.barangayCode)}, 
                      {getCityMunicipalityName(profile?.cityMunicipalityCode)}, {getProvinceName(profile?.provinceCode)}
                  </p>
              </div>
            </div>
            
            {profile?.avatar_url && (
              <div className="mt-4">
                <Label className="text-sm font-medium text-muted-foreground">Avatar</Label>
                <img src={profile.avatar_url} alt="User avatar" className="w-24 h-24 rounded-full mt-2 border-2 border-primary/50" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-8">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Appointments</CardTitle>
                    <CardDescription>
                        View your upcoming and past appointments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/dashboard/appointments">
                            Go to My Appointments
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
} 