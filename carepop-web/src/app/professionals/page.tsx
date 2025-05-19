'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react'; // Changed UserMd to User

interface Professional {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
}

export default function ProfessionalsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <p>Loading...</p>
      </div>
    );
  }

  // Placeholder data - replace with actual data fetching
  const professionals: Professional[] = [
    // { id: '1', name: 'Dr. Ada Lovelace', specialty: 'General Medicine', clinic: 'Tech Health Clinic' },
    // { id: '2', name: 'Dr. Charles Babbage', specialty: 'Pediatrics', clinic: 'Children First Hospital' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Find a Professional</h1>
      <Card>
        <CardHeader>
          <CardTitle>Search Healthcare Professionals</CardTitle>
          <CardDescription>
            Find doctors, therapists, and other healthcare providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex w-full max-w-lg items-center space-x-2 mb-6">
            <Input type="text" placeholder="Search by name, specialty, or location..." className="flex-grow" />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search Professionals
            </Button>
          </div>

          {professionals.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No professionals found matching your criteria (Feature under development).
            </p>
          )}

          {professionals.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {professionals.map((prof) => (
                <Card key={prof.id}>
                  <CardHeader className="flex flex-row items-center space-x-3 pb-2">
                    <User className="h-10 w-10 text-primary" /> {/* Changed UserMd to User */}
                    <div>
                      <CardTitle className="text-lg">{prof.name}</CardTitle>
                      <CardDescription>{prof.specialty}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Clinic: {prof.clinic}</p>
                    <Button variant="outline" size="sm" className="mt-3 w-full">
                      View Profile & Book
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 