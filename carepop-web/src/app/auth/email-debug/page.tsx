'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function EmailDebugPage() {
  const [email, setEmail] = useState('');
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  const testEmailConfiguration = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Testing email configuration for:', email);
      
      const siteUrl = window.location.origin;
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
      });

      const result = {
        email,
        siteUrl,
        redirectTo: `${siteUrl}/auth/callback?next=/update-password`,
        timestamp: new Date().toISOString(),
        success: !error,
        error: error?.message,
        data,
      };

      setDebugInfo(result);
      
      if (error) {
        console.error('Email test failed:', error);
      } else {
        console.log('Email test successful:', data);
      }
    } catch (err) {
      console.error('Unexpected error during email test:', err);
      setDebugInfo({
        email,
        timestamp: new Date().toISOString(),
        success: false,
        error: 'Unexpected error occurred',
        details: err,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Email Configuration Debug</h1>
          <p className="text-gray-600 mt-2">This page helps diagnose password reset email issues.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="test-email">Test Email Address</label>
            <Input
              id="test-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email to test"
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={testEmailConfiguration} 
            disabled={isLoading || !email}
            className="min-w-[150px]"
          >
            {isLoading ? 'Testing...' : 'Test Password Reset Email'}
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Email Test Results</h2>
            <div className={`p-4 border rounded mb-4 ${debugInfo.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`font-semibold ${debugInfo.success ? 'text-green-800' : 'text-red-800'}`}>
                {debugInfo.success ? '✅ Email sent successfully' : '❌ Email failed to send'}
              </p>
              {!debugInfo.success && debugInfo.error && (
                <p className="text-red-700 mt-2">Error: {debugInfo.error}</p>
              )}
            </div>
            
            <pre className="bg-white p-4 border rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900">Email Configuration Checklist:</h3>
          <ul className="mt-2 space-y-1 text-blue-800 text-sm">
            <li>✓ Supabase Email Settings configured</li>
            <li>✓ Email templates set up in Supabase</li>
            <li>✓ SMTP settings configured (if using custom email)</li>
            <li>✓ Site URL properly configured in Supabase</li>
            <li>✓ Redirect URLs authorized in Supabase</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900">Common Email Issues:</h3>
          <ul className="mt-2 space-y-1 text-yellow-800 text-sm">
            <li>• Site URL not configured in Supabase project settings</li>
            <li>• Email rate limiting (too many requests)</li>
            <li>• Email provider blocking Supabase emails</li>
            <li>• Invalid redirect URL configuration</li>
            <li>• Email templates not properly set up</li>
            <li>• SMTP authentication issues (if using custom SMTP)</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <h3 className="font-semibold text-gray-900">Environment Variables:</h3>
          <ul className="mt-2 space-y-1 text-gray-700 text-sm">
            <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}</li>
            <li>NEXT_PUBLIC_SITE_URL: {process.env.NEXT_PUBLIC_SITE_URL ? '✅ Set' : '⚠️ Not set (using dynamic URL)'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 