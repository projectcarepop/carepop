'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ServiceCategoryForm } from '../components/ServiceCategoryForm';

export default function NewServiceCategoryPage() {
  return (
    <div className="container mx-auto py-10">
        <div className="mb-6">
            <Button variant="outline" asChild>
                <Link href="/admin/service-categories">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Category List
                </Link>
            </Button>
        </div>
        <h1 className="text-3xl font-bold mb-6">Create New Service Category</h1>
        <ServiceCategoryForm />
    </div>
  );
} 