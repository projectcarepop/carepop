'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ServiceCategoryForm } from '../../components/ServiceCategoryForm';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { fetcher } from '@/lib/utils';

export default function EditServiceCategoryPage() {
    const params = useParams();
    const { id } = params;

    const { data, error, isLoading } = useSWR(`/api/v1/admin/service-categories/${id}`, fetcher);

    if (isLoading) return <div className="container mx-auto py-10 text-center">Loading...</div>;
    if (error) return <div className="container mx-auto py-10 text-center text-red-500">Failed to load category data.</div>;
    if (!data) return <div className="container mx-auto py-10 text-center">Category not found.</div>;

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
            <h1 className="text-3xl font-bold mb-6">Edit Service Category</h1>
            <ServiceCategoryForm initialData={data.data} />
        </div>
    );
} 