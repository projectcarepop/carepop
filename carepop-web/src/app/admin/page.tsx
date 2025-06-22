import { auth } from '@clerk/nextjs/server';

import AccessDenied from '@/components/layout/AccessDenied';
import AdminDashboard from './components/AdminDashboard';

export default async function AdminPage() {
    const { sessionClaims, userId } = await auth();

    // The middleware already protects this page, but as a safeguard,
    // we can double-check for the admin role.
    if (sessionClaims?.metadata?.role !== 'admin') {
      // This line is a fallback and should theoretically not be reached
      // if the middleware is configured correctly.
      return <AccessDenied pageName="Admin Dashboard" />;
    }
    
    // We can pass the admin user's information from Clerk to the dashboard if needed.
    // For now, we'll construct a basic user object.
    const adminUser = {
        id: userId,
        first_name: sessionClaims.firstName || '',
        last_name: sessionClaims.lastName || '',
        email: sessionClaims.email || '',
        roles: ['admin'], // We know they are an admin at this point
    };

    return (
        // Note: The AdminDashboard component might need to be updated to accept the new 'adminUser' object shape.
        <AdminDashboard adminUser={adminUser}>
            <div>
                {/* Dashboard content will go here once APIs are built */}
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Statistics and overview will be available here soon.</p>
            </div>
        </AdminDashboard>
    );
} 