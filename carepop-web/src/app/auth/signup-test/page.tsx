"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpTestPage() {
  const { supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testSignUp = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('Testing signup with various configurations...');
      
      // Test 1: No redirect URL (should work for account creation)
      console.log('Test 1: Basic signup without redirect');
      const { data: data1, error: error1 } = await supabase.auth.signUp({
        email: email,
        password: 'TempPassword123!',
      });
      
      if (error1) {
        console.error('Test 1 failed:', error1);
        setResult({ 
          test: 'Basic signup (no redirect)',
          success: false, 
          error: error1.message,
          data: data1 
        });
        return;
      }
      
      // Test 2: With redirect URL
      console.log('Test 2: Signup with redirect URL');
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { data: data2, error: error2 } = await supabase.auth.signUp({
        email: email + '.test',
        password: 'TempPassword123!',
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/auth/email-verified`,
        },
      });
      
      setResult({
        test1: {
          name: 'Basic signup (no redirect)',
          success: !error1,
          error: error1?.message,
          data: data1
        },
        test2: {
          name: 'Signup with redirect',
          success: !error2,
          error: error2?.message,
          data: data2
        },
        config: {
          siteUrl,
          origin: window.location.origin,
          env: process.env.NEXT_PUBLIC_SITE_URL,
          usingEnv: !!process.env.NEXT_PUBLIC_SITE_URL
        }
      });
      
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setResult({ 
        success: false, 
        error: err.message,
        type: 'unexpected'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Signup Debug Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="test@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={testSignUp} 
            disabled={isLoading || !email}
          >
            {isLoading ? 'Testing...' : 'Test Signup'}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-50 border rounded">
              <h3 className="font-semibold mb-2">Test Results:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
            <p><strong>Environment:</strong> {process.env.NEXT_PUBLIC_SITE_URL || 'Not set'}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 