import { auth } from "@clerk/nextjs/server";
import { unstable_noStore as noStore } from 'next/cache';
import { AppointmentTableClient } from './AppointmentTableClient';

async function getAppointments(searchParams: { [key: string]: string | string[] | undefined }) {
  noStore();
  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    throw new Error("Unauthorized: No token found.");
  }

  const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  if (!backendApiUrl) {
    throw new Error("Backend API URL is not configured.");
  }

  const params = new URLSearchParams({
    clinicId: String(searchParams.clinicId ?? ''),
    page: String(searchParams.page ?? '1'),
    per_page: String(searchParams.per_page ?? '10'),
    sort: String(searchParams.sort ?? 'startTime.desc'),
    searchTerm: String(searchParams.searchTerm ?? ''),
  });

  const response = await fetch(`${backendApiUrl}/api/v1/booking/admin/appointments?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Error response from backend:", errorBody);
    throw new Error(`Failed to fetch appointments: ${response.statusText}`);
  }

  return response.json();
}

export async function AppointmentTable({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  try {
    const { appointments, totalRecords } = await getAppointments(searchParams);
    return <AppointmentTableClient data={appointments} totalRecords={totalRecords} error={null} />;
  } catch (error) {
    console.error("Failed to fetch and render appointments:", error);
    const errorMessage = error instanceof Error ? error.message : "There was an error fetching appointment data from the server. Please try again later.";
    return <AppointmentTableClient data={[]} totalRecords={0} error={errorMessage} />;
  }
} 