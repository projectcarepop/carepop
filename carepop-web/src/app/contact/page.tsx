// 'use client'; // Can be a server component - REMOVED

// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; -- REMOVED
// import { Button } from "@/components/ui/button"; -- REMOVED
// import { Input } from "@/components/ui/input"; -- REMOVED
// import { Label } from "@/components/ui/label"; -- REMOVED
// import { Textarea } from "@/components/ui/textarea"; -- REMOVED
// import { Mail, Phone, MapPin } from "lucide-react"; -- REMOVED MapPin is still used in contact-form.tsx
import { Metadata } from 'next';
import ContactForm from './contact-form'; // ADDED IMPORT

export const metadata: Metadata = {
  title: 'Contact Us - CarePoP',
  description: 'Get in touch with CarePoP. We are here to answer your questions and receive your feedback.',
};

export default function ContactPage() {
  // Basic form state - in a real app, you'd handle submission (e.g., to an API endpoint)
  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {  -- REMOVED
  //   e.preventDefault(); -- REMOVED
  //   alert('Form submitted (placeholder)! In a real app, this would send data.'); -- REMOVED
  //   // Reset form or show success message -- REMOVED
  // }; -- REMOVED

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center">Contact Us</h1>
      <p className="text-center text-muted-foreground">
        We&apos;d love to hear from you! Reach out with any questions or feedback.
      </p>

      <ContactForm /> {/* REPLACED form and info card section with the new component  */}
    </div>
  );
} 