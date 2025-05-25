'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarDays, Clock, Stethoscope, Building, Briefcase, MessageSquareText, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Assuming MOCK_CLINICS, MOCK_SERVICES, MOCK_PROVIDERS are available 
// or passed down, or fetched via a context/hook for display purposes.
// For this component, we'll re-define simplified versions for display logic.

interface DisplayClinic {
  id: string;
  name: string;
  address: string;
}

interface DisplayService {
  id: string;
  name: string;
  duration: string;
  price: string;
}

interface DisplayProvider {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
}

// Simplified Mock Data for display lookup (ideally from a shared source or props)
const MOCK_CLINICS_DISPLAY: DisplayClinic[] = [
  { id: 'clinic-1', name: 'CarePoP Central Clinic', address: '123 Health St, Wellness City' },
  { id: 'clinic-2', name: 'Northside Community Health', address: '456 Cure Ave, Remedy Town' },
  { id: 'clinic-3', name: 'Eastwood Medical Hub', address: '789 Vitality Rd, Recovery Suburb' },
];

const MOCK_SERVICES_DISPLAY: DisplayService[] = [
  { id: 'service-a1', name: 'General Consultation', duration: '30 mins', price: '₱500' },
  { id: 'service-b2', name: 'Regular Check-up', duration: '45 mins', price: '₱750' },
  { id: 'service-c3', name: 'Specialist Follow-up', duration: '60 mins', price: '₱1200' },
  { id: 'service-d4', name: 'Minor Procedure', duration: '90 mins', price: '₱2500' },
];

const MOCK_PROVIDERS_DISPLAY: DisplayProvider[] = [
  { id: 'provider-101', name: 'Dr. Angela Merkel', specialty: 'General Practitioner', avatarUrl: '/images/avatars/provider-female-1.jpg' },
  { id: 'provider-102', name: 'Dr. Ben Carson', specialty: 'Pediatrician', avatarUrl: '/images/avatars/provider-male-1.jpg' },
  { id: 'provider-103', name: 'Dr. Condoleezza Rice', specialty: 'Cardiologist', avatarUrl: '/images/avatars/provider-female-2.jpg' },
  { id: 'provider-104', name: 'Dr. John Smith (No Reviews)', specialty: 'General Practitioner' },
];

interface ConfirmationStepProps {
  selectedClinicId: string | null;
  selectedServiceId: string | null;
  selectedProviderId: string | null;
  selectedDate: Date | undefined;
  selectedTimeSlot: string | null;
  appointmentNotes?: string;
}

interface SummaryItemProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode | string;
  className?: string;
  avatarUrl?: string;
}

const SummaryItem: React.FC<SummaryItemProps> = ({ icon: Icon, label, value, className, avatarUrl }) => (
  <div className={cn("flex items-start space-x-3 py-3", className)}>
    {avatarUrl ? (
      <img src={avatarUrl} alt={typeof value === 'string' ? value : label} className="h-10 w-10 rounded-full flex-shrink-0 mt-0.5" />
    ) : (
      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
    )}
    <div className="flex-grow">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-md font-semibold text-foreground">
        {value || <span className="italic text-sm font-normal text-muted-foreground/80">Not selected</span>}
      </p>
    </div>
  </div>
);

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedClinicId,
  selectedServiceId,
  selectedProviderId,
  selectedDate,
  selectedTimeSlot,
  appointmentNotes,
}) => {
  const clinic = MOCK_CLINICS_DISPLAY.find(c => c.id === selectedClinicId);
  const service = MOCK_SERVICES_DISPLAY.find(s => s.id === selectedServiceId);
  const provider = MOCK_PROVIDERS_DISPLAY.find(p => p.id === selectedProviderId);

  const formattedDate = selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : null;

  return (
    <div className={cn('space-y-6')}>
      <div className="space-y-2 text-center">
        <h3 className="text-2xl font-semibold tracking-tight">
          Confirm Your Booking Details
        </h3>
        <p className="text-muted-foreground">
          Please review your appointment details below before confirming.
        </p>
      </div>

      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 pb-3 pt-4 px-6">
          <CardTitle className="text-lg flex items-center">
            <CalendarDays className="mr-2 h-5 w-5 text-primary"/>
            Appointment Summary
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <div className="px-6 pt-4 pb-6 space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground pb-2">Location & Service</h4>
            <SummaryItem 
              icon={Building} 
              label="Clinic" 
              value={clinic ? `${clinic.name} - ${clinic.address}` : 'Clinic details missing'} 
            />
            <SummaryItem 
              icon={Briefcase} 
              label="Service" 
              value={service ? `${service.name} (${service.duration} - ${service.price})` : 'Service details missing'} 
            />
            <SummaryItem 
              icon={Stethoscope} 
              label="Provider" 
              value={provider ? `${provider.name} (${provider.specialty})` : 'Provider details missing'}
              avatarUrl={provider?.avatarUrl}
            />
          </div>
          
          <Separator />

          <div className="p-6 space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground pb-2">Date & Time</h4>
            <SummaryItem icon={CalendarDays} label="Date" value={formattedDate} />
            <SummaryItem icon={Clock} label="Time Slot" value={selectedTimeSlot} />
          </div>

          {appointmentNotes && (
            <>
              <Separator />
              <div className="p-6 space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground pb-2">Additional Information</h4>
                <SummaryItem icon={MessageSquareText} label="Your Notes" value={appointmentNotes} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert variant="default" className="bg-primary/5 border-primary/20 text-primary">
        <UserCircle className="h-4 w-4 !text-primary" /> 
        <AlertTitle className="font-semibold">Ready to Book?</AlertTitle>
        <AlertDescription className="text-sm">
          If all details are correct, click the "Confirm Booking" button to finalize your appointment.
          You will receive a confirmation email shortly after (mock functionality).
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConfirmationStep; 