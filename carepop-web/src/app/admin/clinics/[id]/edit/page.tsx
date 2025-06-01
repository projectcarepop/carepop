'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, Profile } from '@/lib/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// This should match the DTO expected by your PUT /api/v1/admin/clinics/:id endpoint
interface UpdateClinicDto {
  name: string;
  full_address: string;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website?: string | null;
  operating_hours?: Record<string, string> | string | null;
  is_active: boolean;
  fpop_chapter_id?: string | null;
  notes?: string | null;
}

interface ProfileWithRole extends Profile {
  role?: string;
}

export default function EditClinicPage({ params }: { params: { id: string } }) {
  const { user, profile: authProfile, isLoading: authLoading, session } = useAuth();
  const profile = authProfile as ProfileWithRole | null;
  const router = useRouter();

  const [formData, setFormData] = useState<UpdateClinicDto>({
    name: '',
    full_address: '',
    latitude: null,
    longitude: null,
    contact_phone: null,
    contact_email: null,
    website: null,
    operating_hours: null,
    is_active: true,
    fpop_chapter_id: null,
    notes: null,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [operatingHoursString, setOperatingHoursString] = useState('');

  // Fetch the clinic data to pre-populate the form
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
        
        // Format the data for the form
        setFormData({
          name: data.name,
          full_address: data.full_address,
          latitude: data.latitude,
          longitude: data.longitude,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
          website: data.website,
          operating_hours: data.operating_hours,
          is_active: data.is_active,
          fpop_chapter_id: data.fpop_chapter_id,
          notes: data.notes,
        });
        
        // Set operating hours string if it exists
        if (data.operating_hours) {
          setOperatingHoursString(JSON.stringify(data.operating_hours, null, 2));
        }
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    }
  };
  
  const handleOperatingHoursChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOperatingHoursString(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const token = session?.access_token;
    if (!token) {
      setError("Authentication token not found. Please log in again.");
      setIsSaving(false);
      return;
    }

    let parsedOperatingHours: Record<string, string> | null = null;
    if (operatingHoursString.trim() !== '') {
      try {
        parsedOperatingHours = JSON.parse(operatingHoursString);
      } catch (jsonError) {
        console.error("Error parsing operating hours JSON:", jsonError);
        setError(`Operating hours must be a valid JSON object (e.g., {\"Mon\": \"9am-5pm\"}) or empty. Error: ${jsonError instanceof Error ? jsonError.message : 'Invalid JSON'}`);
        setIsSaving(false);
        return;
      }
    }

    const payload: UpdateClinicDto = {
      ...formData,
      operating_hours: parsedOperatingHours,
    };
    
    // Basic client-side validation
    if (!formData.name.trim() || !formData.full_address.trim()) {
      setError("Name and Full Address are required.");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/v1/admin/clinics/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to update clinic. Please check your input.' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Redirect to the clinic details page on success
      router.push(`/admin/clinics/${params.id}`);

    } catch (err: unknown) {
      console.error('Error updating clinic:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
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
    return <p className="container mx-auto py-8">Loading clinic data...</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Clinic</CardTitle>
          <CardDescription>Update the details for {formData.name}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Clinic Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g., CarePoP Wellness Center" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_address">Full Address <span className="text-red-500">*</span></Label>
              <Textarea id="full_address" name="full_address" value={formData.full_address} onChange={handleChange} required placeholder="123 Main St, City, Province, Postal Code" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" name="latitude" type="number" value={formData.latitude ?? ''} onChange={handleChange} placeholder="e.g., 14.5995" step="any"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" name="longitude" type="number" value={formData.longitude ?? ''} onChange={handleChange} placeholder="e.g., 120.9842" step="any"/>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input id="contact_phone" name="contact_phone" value={formData.contact_phone ?? ''} onChange={handleChange} placeholder="e.g., +639171234567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input id="contact_email" name="contact_email" type="email" value={formData.contact_email ?? ''} onChange={handleChange} placeholder="e.g., contact@clinic.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" value={formData.website ?? ''} onChange={handleChange} placeholder="e.g., https://clinic.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operating_hours">Operating Hours (JSON format)</Label>
              <Textarea 
                id="operating_hours" 
                name="operating_hours" 
                value={operatingHoursString} 
                onChange={handleOperatingHoursChange} 
                placeholder='e.g., {&#92;"Mon\": \"9am-5pm\", \"Tue\": \"9am-5pm\", \"Wed\": \"Closed\"}' 
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Enter as a valid JSON object. Example: {`{"Mon": "9am-5pm", "Tue-Fri": "9am-6pm", "Sat": "10am-2pm", "Sun": "Closed"}`}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fpop_chapter_id">FPOP Chapter ID (Optional)</Label>
              <Input id="fpop_chapter_id" name="fpop_chapter_id" value={formData.fpop_chapter_id ?? ''} onChange={handleChange} placeholder="UUID of FPOP Chapter if applicable" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea id="notes" name="notes" value={formData.notes ?? ''} onChange={handleChange} placeholder="Any internal notes about the clinic" />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="is_active" name="is_active" checked={formData.is_active} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: Boolean(checked) }))} />
              <Label htmlFor="is_active" className="font-medium">
                Clinic is Active
              </Label>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          
          </CardContent>
          <CardFooter className="flex justify-between space-x-2 pt-6">
            <Link href={`/admin/clinics/${params.id}`}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSaving || authLoading}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 