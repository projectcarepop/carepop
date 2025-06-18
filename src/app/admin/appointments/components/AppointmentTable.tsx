const { data, error, count } = await query;

if(error) {
    console.error("Error fetching appointments: ", JSON.stringify(error, null, 2));
    // Propagate a clear error message
    return { appointments: [], totalRecords: 0, error: "Failed to fetch appointments. Please check the connection." };
}

return { appointments: data as unknown as Appointment[], totalRecords: count ?? 0, error: null };
}

export async function AppointmentTable(props: GetAppointmentsParams) {
// ... existing code ...
} 