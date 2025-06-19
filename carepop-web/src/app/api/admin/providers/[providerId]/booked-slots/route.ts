import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  duration: z.string().refine(val => !isNaN(parseInt(val, 10)) && parseInt(val, 10) > 0).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { providerId: string } }
) {
  const providerId = params.providerId;
  const { searchParams } = new URL(request.url);

  const validation = schema.safeParse({ 
    date: searchParams.get('date'),
    duration: searchParams.get('duration') 
  });

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid date parameter', details: validation.error.flatten() }, { status: 400 });
  }

  const { date } = validation.data;
  const targetDate = new Date(date);
  
  // Set to start and end of day in UTC
  const startDate = new Date(targetDate.setUTCHours(0, 0, 0, 0)).toISOString();
  const endDate = new Date(targetDate.setUTCHours(23, 59, 59, 999)).toISOString();

  if (!providerId) {
    return NextResponse.json({ error: 'Provider ID is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('appointments')
      .select('appointment_datetime, duration_minutes')
      .eq('provider_id', providerId)
      .gte('appointment_datetime', startDate)
      .lte('appointment_datetime', endDate)
      .in('status', ['confirmed', 'pending_confirmation']); // Only consider active appointments

    if (error) {
      throw error;
    }

    const bookedSlots = data.map(appt => ({
        startTime: new Date(appt.appointment_datetime),
        endTime: new Date(new Date(appt.appointment_datetime).getTime() + (appt.duration_minutes || 60) * 60000)
    }));
    
    return NextResponse.json(bookedSlots);
  } catch (error: any) {
    console.error('Error fetching booked slots:', error);
    return NextResponse.json({ error: 'Failed to fetch booked slots', details: error.message }, { status: 500 });
  }
} 