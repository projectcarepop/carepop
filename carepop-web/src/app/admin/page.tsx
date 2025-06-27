import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
// import AdminDashboardClient from './_components/AdminDashboardClient'; // This component was deleted
import type { Profile, AdminStats } from '@/lib/types';

async function getAdminDashboardData() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { error: 'Not Authenticated', stats: null };
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return { error: 'API URL not configured', stats: null };
  }
  const headers = { 'Authorization': `Bearer ${session.access_token}` };

  const profileRes = await fetch(`${apiUrl}/api/me/profile`, { headers, cache: 'no-store' });
  if (!profileRes.ok) {
    return { error: 'Failed to fetch user profile', stats: null };
  }
  const profile: Profile = await profileRes.json();

  if (profile.role !== 'admin') {
    return { error: 'Not Authorized', stats: null };
  }

  try {
    const statsRes = await fetch(`${apiUrl}/api/admin/stats`, { headers });
    if (!statsRes.ok) {
        const errorBody = await statsRes.json().catch(() => ({ message: 'Failed to fetch stats' }));
        return { error: errorBody.message, stats: null };
    }
    const stats: AdminStats = await statsRes.json();
    return { error: null, stats };
  } catch (e: any) {
    console.error("Fetch error in getAdminDashboardData:", e);
    return { error: e.message || 'An unknown fetch error occurred', stats: null };
  }
}

export default async function AdminDashboardPage() {
  const { error, stats } = await getAdminDashboardData();

  if (error === 'Not Authenticated') {
    redirect('/sign-in?redirect=/admin');
  }
  if (error === 'Not Authorized') {
    redirect('/forbidden');
  }
  if (error || !stats) {
    return <div className="p-4 text-red-500">Error: {error || 'Could not load dashboard data.'}</div>;
  }

  // return <AdminDashboardClient initialStats={stats} />;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total Users</h2>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Upcoming Appointments</h2>
          <p className="text-3xl font-bold">{stats.upcomingAppointments}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total Clinics</h2>
          <p className="text-3xl font-bold">{stats.totalClinics}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total Doctors</h2>
          <p className="text-3xl font-bold">{stats.totalDoctors}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total Services</h2>
          <p className="text-3xl font-bold">{stats.totalServices}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Products Out of Stock</h2>
          <p className="text-3xl font-bold">{stats.productsOutOfStock}</p>
        </div>
      </div>
    </div>
  );
} 