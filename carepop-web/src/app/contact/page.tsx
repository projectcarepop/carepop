import { Metadata } from 'next';
import ContactFormPage from './contact-form-page';

export const metadata: Metadata = {
  title: 'Contact Us - CarePoP',
  description: 'Get in touch with CarePoP. We are here to answer your questions and receive your feedback.',
};

export default function ContactPage() {
  return <ContactFormPage />;
} 