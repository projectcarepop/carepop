import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <h1>Authentication Error</h1>
      <p>There was a problem verifying your login. The link may have expired or been used already.</p>
      <p>Please try signing in again.</p>
      <Link href="/sign-in" style={{ marginTop: '20px', color: 'blue' }}>
        Go to Sign In
      </Link>
    </div>
  );
} 