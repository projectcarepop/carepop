import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AuthCodeErrorProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function AuthCodeError({ searchParams }: AuthCodeErrorProps) {
  const error = searchParams.error as string;
  const description = searchParams.description as string;

  const getErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'access_denied':
        return 'You cancelled the login process. Please try again if you want to sign in.';
      case 'exchange_failed':
        return 'There was a problem completing your login. This might be due to an expired or invalid authentication code.';
      case 'missing_code':
        return 'The authentication callback was called incorrectly. Please try signing in again.';
      case 'unexpected_error':
        return 'An unexpected error occurred during authentication. Please try again.';
      default:
        return 'There was a problem verifying your login. The link may have expired or been used already.';
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Authentication Error</h1>
          <div className="mt-4 space-y-2">
            <p className="text-gray-700">
              {error ? getErrorMessage(error) : 'There was a problem with your authentication.'}
            </p>
            {description && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Details:</strong> {description}
                </p>
              </div>
            )}
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                <p className="text-xs text-red-600">
                  <strong>Error Code:</strong> {error}
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/sign-in">
              Try Signing In Again
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
} 