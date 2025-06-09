'use client';

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const getActiveTab = () => {
    if (pathname.includes('/categories')) {
      return 'categories';
    }
    return 'services';
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Services Management</h1>
      </div>
      <p className="text-muted-foreground">
        Manage all clinic services and their categories.
      </p>

      <Tabs defaultValue={getActiveTab()} className="space-y-4">
        <TabsList>
            <Link href="/admin/services">
              <TabsTrigger value="services">Services</TabsTrigger>
            </Link>
            <Link href="/admin/services/categories">
              <TabsTrigger value="categories">Categories</TabsTrigger>
            </Link>
        </TabsList>
        {children}
      </Tabs>
    </div>
  );
} 