'use server';

import { z } from 'zod';
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Define the schema for the contact form using Zod for validation
const ContactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export type ContactFormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    subject?: string[];
    message?: string[];
  };
  success: boolean;
};

/**
 * Server action to handle the contact form submission.
 * Validates the form data and sends an email using Resend.
 */
export async function sendContactEmail(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  // Validate form fields
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  });

  // If validation fails, return the errors
  if (!validatedFields.success) {
    return {
      message: 'Validation failed. Please check your input.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { name, email, subject, message } = validatedFields.data;

  try {
    const { error } = await resend.emails.send({
      from: 'CarePop Contact Form <onboarding@resend.dev>', // This must be a verified domain in Resend
      to: 'projectcarepop@gmail.com',
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h1>New message from CarePop Contact Form</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });
    
    if (error) {
        console.error('Resend Error:', error);
        return {
            message: 'Failed to send message. Please try again later.',
            success: false,
        };
    }

    return {
      message: 'Thank you for your message! We will get back to you soon.',
      success: true,
    };
  } catch (e) {
    console.error('Email sending error:', e);
    return {
      message: 'An unexpected error occurred. Please try again later.',
      success: false,
    };
  }
} 