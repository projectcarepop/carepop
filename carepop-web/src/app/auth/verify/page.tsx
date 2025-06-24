import Link from 'next/link';

export default function VerifyRequestPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <h1>Check your email</h1>
      <p>A sign-in link has been sent to your email address.</p>
      <p>You can close this tab.</p>
    </div>
  );
} 