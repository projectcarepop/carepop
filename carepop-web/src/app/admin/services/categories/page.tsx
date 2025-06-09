import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ServiceCategoryTable } from '../components/ServiceCategoryTable';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';

export default function AdminServiceCategoriesPage() {
  return (
    <TabsContent value="categories" className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>All Service Categories</CardTitle>
                    <CardDescription>
                        Group your services into categories for better organization.
                    </CardDescription>
                </div>
                <Button asChild>
                    <Link href="/admin/service-categories/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Category
                    </Link>
                </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ServiceCategoryTable />
          </CardContent>
        </Card>
    </TabsContent>
  );
} 