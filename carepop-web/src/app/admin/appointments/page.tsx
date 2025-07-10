import { Card, CardContent } from "@/components/ui/card";
import { AppointmentsClient } from "./_components/AppointmentsClient";
import { getAdminAppointments } from "@/services/api";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export default async function AdminAppointmentsPage() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();
    
    // We fetch initial data on the server for faster page load and SEO.
    // The client-side react-query will take over from here.
    const initialAppointments = await getAdminAppointments(session!.access_token, { limit: 10 });

    return (
        <Card>
            <CardContent className="pt-6">
                <AppointmentsClient initialAppointments={initialAppointments} />
            </CardContent>
        </Card>
    );
}
