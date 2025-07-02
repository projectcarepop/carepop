import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminDashboardMetrics } from '@/services/api';

export async function GET() {
  const cookieStore = cookies();
  
  try {
    // getAdminDashboardMetrics is already designed to handle auth and data fetching
    const { data, error } = await getAdminDashboardMetrics(cookieStore);

    if (error) {
      // Pass along the specific error message from the service
      return NextResponse.json({ message: error }, { status: 401 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in metrics proxy route:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
} 