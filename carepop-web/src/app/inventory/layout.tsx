import * as React from 'react';
import InventorySidebar from './_components/InventorySidebar';
import AccessDenied from "@/components/layout/AccessDenied";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function InventoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
        // This case should be handled by middleware, but as a safeguard:
        return <AccessDenied pageName="the inventory management page" />;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

    const isAuthorized = profile?.role === 'admin' || profile?.role === 'manager';

    if (!isAuthorized) {
        return <AccessDenied pageName="the inventory management page" />;
    }

    return (
        <div className="w-full">
            <InventorySidebar />
            <main className="sm:ml-14 flex-1">
                {children}
            </main>
        </div>
    );
} 