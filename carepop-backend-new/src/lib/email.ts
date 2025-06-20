import { Resend } from 'resend';
import { env } from '../config';

const resend = new Resend(env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

async function sendEmail(options: EmailOptions) {
  const { to, subject, html, from = 'onboarding@resend.dev' } = options;

  try {
    const { data, error } = await resend.emails.send({
      from: from, // NOTE: Must be a domain you have verified with Resend
      to: [to],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending email:', error);
      // In a real app, you might throw a custom error to be handled by a global error handler
      throw new Error('Failed to send email.');
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Caught exception in sendEmail:', error);
    throw error;
  }
}

export const emailService = {
  sendEmail,
}; 