import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import InventoryClient from "./_components/InventoryClient";

export default async function InventoryPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Fetch all clinics to pass to the client component selector
    const { data: clinics, error } = await supabase
        .from('clinics')
        .select('id, name')
        .order('name', { ascending: true });

    if (error) {
        console.error("Failed to fetch clinics for inventory page:", error);
        return <div>Error loading clinic data. Please try again later.</div>;
    }

    return <InventoryClient clinics={clinics || []} />;
} 