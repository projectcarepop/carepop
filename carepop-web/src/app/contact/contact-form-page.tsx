'use client';

import React, { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { sendContactEmail, type ContactFormState } from './actions';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full font-inter" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Send Message
        </Button>
    );
}

export default function ContactFormPage() {
    const initialState: ContactFormState = { message: '', success: false };
    const [state, formAction] = useFormState(sendContactEmail, initialState);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state.success]);

  return (
    <>
      {/* Hero Section */}
      <section className="w-full py-16 md:py-20 lg:py-24 bg-muted">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-space-grotesk text-primary">
              Get In Touch
            </h1>
            <p className="max-w-[800px] text-muted-foreground md:text-xl font-inter">
              Have a question or feedback? We&apos;d love to hear from you. Reach out, and we&apos;ll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full py-16 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Contact Information */}
                <div className="flex flex-col space-y-8">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-space-grotesk">Contact Information</h2>
                        <p className="text-muted-foreground font-inter">
                            You can reach us via email, phone, or by visiting our partner&apos;s office.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <MapPin className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                            <h3 className="text-xl font-semibold font-space-grotesk">Address</h3>
                            <p className="text-muted-foreground font-inter">c/o FPOP, Sampaloc, Manila, Philippines</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Mail className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                            <h3 className="text-xl font-semibold font-space-grotesk">Email</h3>
                            <p className="text-muted-foreground font-inter">
                                <a href="mailto:projectcarepop@gmail.com" className="hover:underline">
                                projectcarepop@gmail.com
                                </a>
                            </p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Phone className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                            <h3 className="text-xl font-semibold font-space-grotesk">Phone</h3>
                            <p className="text-muted-foreground font-inter">+63 915 031 2208</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="font-space-grotesk text-2xl">Send us a Message</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form ref={formRef} action={formAction} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-inter">Full Name</Label>
                                <Input id="name" name="name" placeholder="Your Name" required className="font-inter"/>
                                {state.errors?.name && <p className="text-sm font-medium text-destructive">{state.errors.name[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-inter">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="font-inter"/>
                                {state.errors?.email && <p className="text-sm font-medium text-destructive">{state.errors.email[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject" className="font-inter">Subject</Label>
                                <Input id="subject" name="subject" placeholder="Question about..." required className="font-inter"/>
                                {state.errors?.subject && <p className="text-sm font-medium text-destructive">{state.errors.subject[0]}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message" className="font-inter">Message</Label>
                                <Textarea id="message" name="message" placeholder="Your message..." rows={5} required className="font-inter"/>
                                {state.errors?.message && <p className="text-sm font-medium text-destructive">{state.errors.message[0]}</p>}
                            </div>
                            <SubmitButton />
                            {state.message && (
                                <div className={`flex items-center space-x-2 mt-4 p-3 rounded-md ${state.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {state.success ? <CheckCircle className="h-5 w-5"/> : <AlertTriangle className="h-5 w-5"/>}
                                    <p className="text-sm font-medium">{state.message}</p>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </section>
    </>
  );
} 