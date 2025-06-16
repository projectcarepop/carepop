import { Metadata } from 'next';
import BookServicePageClient from './BookServicePageClient';

export const metadata: Metadata = {
  title: 'Book a Service - CarePoP',
  description: 'Schedule your appointment with a healthcare provider in just a few simple steps.',
  alternates: {
    canonical: '/book-service',
  },
};

export default function BookServicePage() {
  return <BookServicePageClient />;
} 