import { ReactNode } from 'react';
import AdminHeader from '@/components/layout/AdminHeader'; // Assuming an AdminHeader component might be created
import { AuthProvider } from '@/lib/contexts/AuthContext'; // Re-wrap with AuthProvider if needed, or ensure parent has it

// TODO: Add proper role-based access control to this layout

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    // <AuthProvider> // Only if not already provided by a higher-level layout
    <>
      {/* <AdminHeader /> */}
      {/* <nav>Admin Navigation Placeholder</nav> */}
      <main className="p-4">
        {/* Add a check here to ensure only admin users can access this section */}
        {/* For now, rendering children directly */}
        {children}
      </main>
    </>
    // </AuthProvider>
  );
} 