"use client";

import React from 'react';

// TODO: Define the actual type for an appointment
type Appointment = any;

interface AppointmentsTableProps {
  data: Appointment[];
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>You have no appointments scheduled.</p>
      </div>
    );
  }

  return (
    <div>
      <p>Appointments Table Placeholder - {data.length} appointments</p>
      {/* A full table implementation will go here */}
    </div>
  );
}; 