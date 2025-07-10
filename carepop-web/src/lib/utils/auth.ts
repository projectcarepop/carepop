import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Define role permissions for different admin paths
export const ADMIN_ROLE_PERMISSIONS = {
  admin: [
    '/admin',
    '/admin/appointments', 
    '/admin/clinics',
    '/admin/doctors',
    '/admin/services', 
    '/admin/users',
    '/admin/booking-management',
  ],
  manager: [
    '/admin/appointments', // Only appointments for managers
  ]
} as const;

export async function requireAdminRole(allowedRoles: string[] = ['admin']) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile?.role || !allowedRoles.includes(profile.role)) {
    redirect('/forbidden');
  }

  return { user, profile };
}

export function canUserAccessPath(userRole: string, path: string): boolean {
  const allowedPaths = ADMIN_ROLE_PERMISSIONS[userRole as keyof typeof ADMIN_ROLE_PERMISSIONS];
  if (!allowedPaths) return false;
  
  return allowedPaths.some(allowedPath => path.startsWith(allowedPath));
} 