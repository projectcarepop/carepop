import { Resend } from 'resend';
import { env } from '../config';

const resend = new Resend(env.RESEND_API_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Set a timeout for the email sending operation in milliseconds
const EMAIL_SEND_TIMEOUT = 10000; // 10 seconds

async function sendEmail(options: EmailOptions) {
  // IMPORTANT: Replace with your verified Resend domain.
  // Using 'onboarding@resend.dev' will cause timeouts.
  const { to, subject, html, from = 'noreply@your-verified-domain.com' } = options;

  try {
    const sendPromise = resend.emails.send({
      from: from,
      to: [to],
      subject: subject,
      html: html,
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Email sending timed out')), EMAIL_SEND_TIMEOUT)
    );

    // Race the send promise against the timeout
    const result = (await Promise.race([sendPromise, timeoutPromise])) as { data: any; error: any };

    const { data, error } = result;

    if (error) {
      console.error('Error sending email:', error);
      // Do not re-throw the error to prevent crashing the main flow
      return; 
    }

    console.log('Email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('Caught exception in sendEmail (likely a timeout):', error);
    // Do not re-throw, just log the error.
    // The main registration process should not fail if the email fails.
  }
}

export const emailService = {
  sendEmail,
}; 