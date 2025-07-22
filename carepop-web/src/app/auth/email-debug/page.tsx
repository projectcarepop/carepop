"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function EmailDebugPage() {
  const { supabase } = useAuth();
  const [testEmail, setTestEmail] = useState('');
  const [isTestingSend, setIsTestingSend] = useState(false);
  const [isTestingResend, setIsTestingResend] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();

  // Environment variables check
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing',
  };

  const handleTestSignUp = async () => {
    if (!testEmail) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter an email address to test',
      });
      return;
    }

    setIsTestingSend(true);
    try {
      // Use environment variable for production reliability, fallback to location.origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || location.origin;
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'TempPassword123!',
        options: {
          emailRedirectTo: `${siteUrl}/auth/callback?next=/auth/email-verified`,
        },
      });

      setDebugInfo({
        timestamp: new Date().toISOString(),
        email: testEmail,
        data,
        error,
        redirectUrl: `${siteUrl}/auth/callback?next=/auth/email-verified`,
        origin: location.origin,
        siteUrl: siteUrl,
        usingEnvVar: !!process.env.NEXT_PUBLIC_SITE_URL,
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Sign-up failed',
          description: error.message,
        });
      } else {
        toast({
          title: 'Test sign-up initiated',
          description: 'Check the debug info below and your email inbox',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Unexpected error',
        description: err.message || 'An unexpected error occurred',
      });
    } finally {
      setIsTestingSend(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!testEmail) {
      toast({
        variant: 'destructive',
        title: 'Email required',
        description: 'Please enter an email address',
      });
      return;
    }

    setIsTestingResend(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: testEmail,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback?next=/auth/email-verified`,
        },
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Resend failed',
          description: error.message,
        });
      } else {
        toast({
          title: 'Confirmation email resent',
          description: 'Check your email inbox',
        });
      }
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Unexpected error',
        description: err.message || 'An unexpected error occurred',
      });
    } finally {
      setIsTestingResend(false);
    }
  };



  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Email Confirmation Debug</h1>
          <p className="text-muted-foreground mt-2">
            Debug tool to identify email confirmation issues
          </p>
        </div>

        {/* Environment Variables Check */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Environment Variables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(envVars).map(([key, status]) => (
                <div key={key} className="flex justify-between items-center">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">{key}</code>
                  <Badge variant={status.includes('✓') ? 'default' : 'destructive'}>
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Email Sending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Test Email Sending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter test email address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
                             <Button 
                 onClick={handleTestSignUp}
                 disabled={isTestingSend}
               >
                 {isTestingSend ? 'Testing...' : 'Test Sign-Up'}
               </Button>
               <Button 
                 variant="outline"
                 onClick={handleResendConfirmation}
                 disabled={isTestingResend}
               >
                 {isTestingResend ? 'Resending...' : 'Resend'}
               </Button>
            </div>
                         <p className="text-sm text-muted-foreground">
               This will attempt to create an account with a temporary password and send a confirmation email.
             </p>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {debugInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Troubleshooting Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                                 <div>
                   <h4 className="font-medium">Check Supabase Email Settings <Badge variant="destructive" className="ml-2">CRITICAL</Badge></h4>
                   <p className="text-sm text-muted-foreground">
                     Go to Supabase Dashboard → Authentication → Settings → Email Templates.
                     Ensure &quot;Enable email confirmations&quot; is turned ON. <strong>Error 500 usually means this is disabled.</strong>
                   </p>
                 </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                                 <div>
                   <h4 className="font-medium">Configure SMTP <Badge variant="outline" className="ml-2">HIGHLY RECOMMENDED</Badge></h4>
                   <p className="text-sm text-muted-foreground">
                     Go to Supabase Dashboard → Project Settings → Auth → SMTP Settings.
                     Configure your own SMTP provider (Gmail, SendGrid, etc.) for reliable email delivery. Default Supabase emails often fail.
                   </p>
                 </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Check Site URL</h4>
                  <p className="text-sm text-muted-foreground">
                    Go to Supabase Dashboard → Authentication → URL Configuration.
                    Ensure your Site URL matches your domain (e.g., https://carepop.online).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">4</span>
                </div>
                <div>
                  <h4 className="font-medium">Check Email Filters</h4>
                  <p className="text-sm text-muted-foreground">
                    Check spam/junk folders. Add noreply@mail.supabase.co to your safe senders list.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-medium">5</span>
                </div>
                <div>
                  <h4 className="font-medium">Rate Limits</h4>
                  <p className="text-sm text-muted-foreground">
                    Supabase has email rate limits. Wait a few minutes between attempts if testing multiple times.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild variant="outline" className="w-full">
              <a 
                href="https://app.supabase.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Open Supabase Dashboard
              </a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/sign-up">
                Back to Sign Up
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 