// ... existing code ...
    return updatedAppointment;
  }

  async listAllAppointments(): Promise<any[]> { // Return type changed to any[] to match the new query structure
    const { data, error } = await this.supabase
      .from('appointments')
      .select(`
        id,
        status,
        appointment_datetime,
        profile:profiles ( full_name ),
        clinic:clinics ( name ),
        service:services ( name ),
        provider:providers ( first_name, last_name )
      `)
      .order('appointment_datetime', { ascending: false });

    if (error) {
      console.error('Error fetching appointments:', error);
      throw new AppError('Failed to fetch appointments.', 500);
    }

    return data || [];
  }
}
