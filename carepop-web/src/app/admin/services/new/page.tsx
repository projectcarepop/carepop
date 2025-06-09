import { ServiceForm } from '../components/ServiceForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function NewServicePage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Service</CardTitle>
          <CardDescription>
            Fill out the form below to add a new clinical service to the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm />
        </CardContent>
      </Card>
    </div>
  );
} 