'use server';

import { z } from 'zod';
import { Resend } from 'resend';
import { zfd } from 'zod-form-data';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactFormSchema = zfd.formData({
    name: zfd.text(z.string().min(2, { message: "Name must be at least 2 characters." })),
    email: zfd.text(z.string().email({ message: "Please enter a valid email." })),
    subject: zfd.text(z.string().min(5, { message: "Subject must be at least 5 characters." })),
    message: zfd.text(z.string().min(10, { message: "Message must be at least 10 characters." })),
});

export type ContactFormState = {
    message: string;
    errors?: {
        name?: string[];
        email?: string[];
        subject?: string[];
        message?: string[];
    };
    isSuccess?: boolean;
};

export async function sendContactEmail(
    prevState: ContactFormState,
    formData: FormData,
): Promise<ContactFormState> {
    const validatedFields = contactFormSchema.safeParse(formData);

    if (!validatedFields.success) {
        return {
            message: 'Please fix the errors below.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, subject, message } = validatedFields.data;

    try {
        const { error } = await resend.emails.send({
            from: 'CarePoP Contact Form <onboarding@resend.dev>',
            to: ['projectcarepop@gmail.com'],
            reply_to: email,
            subject: `Contact Form: ${subject}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });

        if (error) {
            console.error('Resend error:', error);
            return { message: 'Failed to send email. Please try again later.', isSuccess: false };
        }

        return { message: 'Thank you for your message! We will get back to you soon.', isSuccess: true };
    } catch (error) {
        console.error('Email sending error:', error);
        return { message: 'An unexpected error occurred. Please try again later.', isSuccess: false };
    }
} 