import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';

interface ConfirmationPageProps {
    params: {
        appointmentId: string;
    }
}

export default function BookingConfirmationPage({ params }: ConfirmationPageProps) {
    return (
        <div className="container mx-auto py-20 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="mt-4 text-3xl font-bold">Appointment Confirmed!</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Your appointment (ID: {params.appointmentId}) has been successfully booked.
            </p>
            <p className="mt-1">You will receive a confirmation email shortly.</p>
            <div className="mt-8">
                <Button asChild>
                    <Link href="/my-appointments">View My Appointments</Link>
                </Button>
            </div>
        </div>
    );
} 