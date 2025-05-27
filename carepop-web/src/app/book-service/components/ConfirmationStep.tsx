'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarDays, Clock, Stethoscope, Building, Briefcase, MessageSquareText, UserCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Mock data and individual ID props are removed. Component will use bookingDetails.

// Interface for serviceDetails passed within bookingDetails
interface ServiceSubDetails {
  id: string;
  name: string;
  price?: number | null;
  duration?: string | null;
  requiresProviderAssignment: boolean;
}

interface BookingDetails {
  clinicId: string | null;
  clinicName: string | null;
  serviceId: string | null;
  serviceName: string | null; // Direct from BookingForm
  providerId: string | null;
  providerName: string | null;
  providerSpecialty: string | null;
  providerAvatarUrl: string | null;
  date: Date | undefined;
  timeSlot: string | null;
  notes?: string;
  serviceDetails: ServiceSubDetails | null; // Contains price, duration, etc.
}

interface ConfirmationStepProps {
  bookingDetails: BookingDetails;
  onEdit: (stepId: string) => void; // Callback to go back to an edit step
}

interface SummaryItemProps {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode | string;
  className?: string;
  avatarUrl?: string;
  onEdit?: () => void; // Optional edit callback for a specific item
  editStepId?: string; // Step ID to navigate to for editing this item
}

const SummaryItem: React.FC<SummaryItemProps> = ({ icon: Icon, label, value, className, avatarUrl, onEdit, editStepId }) => (
  <div className={cn("flex items-start space-x-3 py-3", className)}>
    {avatarUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={label} className="h-10 w-10 rounded-full flex-shrink-0 mt-0.5 object-cover" />
    ) : (
      <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
    )}
    <div className="flex-grow">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-md font-semibold text-foreground">
        {value || <span className="italic text-sm font-normal text-muted-foreground/80">Not specified</span>}
      </p>
    </div>
    {onEdit && editStepId && (
        <Button variant="ghost" size="sm" onClick={onEdit} className="ml-auto self-start p-1 h-auto">
            <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary"/>
        </Button>
    )}
  </div>
);

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  bookingDetails,
  onEdit
}) => {
  const { 
    clinicName,
    serviceName,
    providerName,
    providerSpecialty,
    providerAvatarUrl,
    date,
    timeSlot,
    notes,
    serviceDetails
  } = bookingDetails;

  const formattedDate = date ? format(date, 'EEEE, MMMM d, yyyy') : null;
  const formattedTime = timeSlot ? format(new Date(`1970-01-01T${timeSlot}`), 'h:mm a') : null;
  
  const serviceDisplayInfo = [
    serviceName,
    serviceDetails?.duration ? `(${serviceDetails.duration})` : null,
    serviceDetails?.price !== undefined && serviceDetails?.price !== null ? 
        `₱${serviceDetails.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
        : null
  ].filter(Boolean).join(' - ');

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
              value={clinicName || 'Clinic not selected'} 
              onEdit={() => onEdit('clinicServiceSelection')}
              editStepId="clinicServiceSelection"
            />
            <SummaryItem 
              icon={Briefcase} 
              label="Service" 
              value={serviceDisplayInfo || 'Service not selected'} 
              onEdit={() => onEdit('clinicServiceSelection')}
              editStepId="clinicServiceSelection"
            />
            { (serviceDetails?.requiresProviderAssignment || providerName) && (
                <SummaryItem 
                  icon={Stethoscope} 
                  label="Provider" 
                  value={providerName ? `${providerName}${providerSpecialty ? ` (${providerSpecialty})` : ''}` : 'Any available provider'}
                  avatarUrl={providerAvatarUrl || undefined}
                  onEdit={() => onEdit('providerSelection')}
                  editStepId="providerSelection"
                />
            )}
          </div>
          
          <Separator />

          <div className="p-6 space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground pb-2">Date & Time</h4>
            <SummaryItem 
                icon={CalendarDays} 
                label="Date" 
                value={formattedDate} 
                onEdit={() => onEdit('dateTimeSelection')}
                editStepId="dateTimeSelection"
            />
            <SummaryItem 
                icon={Clock} 
                label="Time Slot" 
                value={formattedTime} 
                onEdit={() => onEdit('dateTimeSelection')}
                editStepId="dateTimeSelection"
            />
          </div>

          {(notes || notes === '') && (
            <>
              <Separator />
              <div className="p-6 space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground pb-2">Additional Information</h4>
                <SummaryItem 
                    icon={MessageSquareText} 
                    label="Your Notes" 
                    value={notes || <span className="italic text-sm font-normal text-muted-foreground/80">No notes provided</span>} 
                    onEdit={() => onEdit('dateTimeSelection')}
                    editStepId="dateTimeSelection"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Alert variant="default" className="bg-primary/5 border-primary/20 text-primary">
        <UserCircle className="h-4 w-4 !text-primary" /> 
        <AlertTitle className="font-semibold">Ready to Book?</AlertTitle>
        <AlertDescription className="text-sm">
          If all details are correct, click the &quot;Confirm Booking&quot; button to finalize your appointment.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConfirmationStep; 