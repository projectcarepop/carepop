'use client';

import { ServiceCategoryForm } from '../components/ServiceCategoryForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NewServiceCategoryPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/service-categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Create New Service Category</CardTitle>
          <CardDescription>
            Fill out the form below to add a new category for services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceCategoryForm />
        </CardContent>
      </Card>
    </div>
  );
} 