import { Metadata } from 'next';
import BookingForm from './components/BookingForm';

export const metadata: Metadata = {
  title: 'Book a Service | CarePoP',
  description: 'Select a service and book your appointment with CarePoP.',
};

export default function BookServicePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        Book a Service
      </h1>
      <BookingForm />
    </div>
  );
} 