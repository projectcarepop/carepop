'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const supabase = createClientComponentClient();

  const checkConfiguration = () => {
    const info = {
      environment: {
        origin: window.location.origin,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      },
      urls: {
        expectedCallbackUrl: `${window.location.origin}/auth/callback`,
        currentUrl: window.location.href,
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    
    setDebugInfo(info);
  };

  const testGoogleAuth = async () => {
    try {
      console.log('Testing Google OAuth configuration...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google OAuth test failed:', error);
        alert(`OAuth test failed: ${error.message}`);
      } else {
        console.log('Google OAuth test initiated:', data);
      }
    } catch (err) {
      console.error('Unexpected error during OAuth test:', err);
      alert('Unexpected error during OAuth test');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Google OAuth Debug</h1>
          <p className="text-gray-600 mt-2">This page helps diagnose Google OAuth issues.</p>
        </div>

        <div className="space-y-4">
          <Button onClick={checkConfiguration}>
            Check Configuration
          </Button>
          
          <Button onClick={testGoogleAuth} variant="outline">
            Test Google OAuth
          </Button>
        </div>

        {debugInfo && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Configuration Debug Info</h2>
            <pre className="bg-white p-4 border rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900">Checklist for Google OAuth Setup:</h3>
          <ul className="mt-2 space-y-1 text-blue-800 text-sm">
            <li>✓ Environment variables set (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)</li>
            <li>✓ Google OAuth configured in Supabase Dashboard</li>
            <li>✓ Redirect URL added in Google Cloud Console: <code>{window.location.origin}/auth/callback</code></li>
            <li>✓ Authorized domains configured in Google Cloud Console</li>
            <li>✓ OAuth consent screen configured</li>
          </ul>
        </div>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-900">Common Issues:</h3>
          <ul className="mt-2 space-y-1 text-yellow-800 text-sm">
            <li>• Redirect URL mismatch between Google Console and Supabase</li>
            <li>• Domain not authorized in Google Cloud Console</li>
            <li>• OAuth consent screen not published</li>
            <li>• Environment variables not loaded properly</li>
            <li>• Browser blocking popups or cookies</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 