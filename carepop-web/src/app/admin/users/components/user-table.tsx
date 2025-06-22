import { auth } from "@clerk/nextjs/server";
import { UserTableClient } from "./user-table-client";
import { unstable_noStore as noStore } from 'next/cache';

// We need to define the User type based on what the client component expects.
// Ideally, this would be in a shared types file.
export type User = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
};

// The server component no longer needs props
async function getUsers(): Promise<User[]> {
  noStore(); // Opt out of caching for this dynamic data
  try {
    const { getToken } = await auth();
    const token = await getToken();

    if (!token) {
      throw new Error("Unauthorized: No token found.");
    }

    const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!backendApiUrl) {
      throw new Error("Backend API URL is not configured.");
    }

    const response = await fetch(`${backendApiUrl}/api/v1/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Error response from backend:", errorBody);
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    const users: User[] = await response.json();
    return users;

  } catch (error) {
    console.error("Error fetching users from backend:", error);
    // Return empty data on error to prevent crashing the page
    return [];
  }
}

export async function UserTable() {
  const users = await getUsers();

  return <UserTableClient data={users} />;
}