"use client"; // Required for hooks and event handlers

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // For redirection
import {
  Button,
  TextInput,
  theme // Import theme for styling if needed
} from '@repo/ui';
// Import the frontend Supabase client creator using relative path from app root
import { createClient } from '../../utils/supabase/client'; 

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Create the supabase client instance
  const supabase = createClient();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Basic Validation
    // TODO: Implement inline validation for better UX
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    // Add password length check if needed based on requirements
    if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
    }

    setLoading(true);

    try {
      // Make the API call to the backend endpoint
      // TODO: Replace with actual backend URL if different (e.g., from env var)
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Attempt to parse JSON response

      if (!response.ok) {
        // Handle errors (e.g., email already exists, server error)
        setError(data.message || `Registration failed: ${response.statusText}`);
      } else {
        // Registration successful!
        // Redirect to login page or a success/confirmation page
        // For now, let's just log success and maybe clear the form?
        console.log('Registration successful:', data);
        // Consider redirecting:
        // router.push('/login?registered=true'); 
        alert('Registration successful! Please check your email to verify.'); // Placeholder alert
      }
    } catch (error) {
      console.error('Registration fetch error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Updated Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setError(null);
    console.log('Attempting Google Sign-In...');
    
    // No need for loading state here, Supabase handles redirect
    try {
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: 'google',
        options: {
            // Default redirect is usually sufficient, Supabase handles the callback.
            // You might need to configure allowed redirect URIs in Supabase dashboard.
            // redirectTo: `${location.origin}/auth/callback` // Example if using a custom callback route
        }
      });
      if (error) throw error;
      // If successful, Supabase redirects the user to Google, 
      // then back to your app (often to the same page or a specified callback).
      // No explicit router.push needed here usually.
    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      setError(error.message || 'Google Sign-In failed. Please try again.');
      // Display error to the user if redirect doesn't happen
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            disabled={loading}
          />
          <TextInput
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            helperText="Must be at least 8 characters."
            disabled={loading}
          />
          {/* TODO: Consider adding a Show/Hide Password toggle */}
          <TextInput
            label="Confirm Password"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            error={error && error.includes('Passwords do not match') ? error : undefined}
            disabled={loading}
          />
          {/* TODO: Consider adding a Show/Hide Password toggle */}

          {/* Display general form errors */}
          {error && !error.includes('Passwords do not match') && (
            <p className="text-sm text-red-600 text-center">{error}</p>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full disabled:opacity-50"
            >
              <Button 
                title={loading ? 'Creating Account...' : 'Create Account'}
                disabled={loading}
                style={{ width: '100%' }}
              />
            </button>
          </div>
        </form>

        {/* Divider */} 
        <div className="my-6 flex items-center justify-center">
          <span className="px-2 text-sm text-gray-500 bg-white">Or continue with</span>
        </div>

        {/* Google Sign-In Button */} 
        <button 
          type="button" 
          onClick={handleGoogleSignIn}
          // No need to disable based on email/pass loading state
          // disabled={loading} 
          className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          {/* Placeholder for Google Icon */} 
          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            {/* Basic G Icon Path - Replace with actual SVG/Icon Component later */} 
            <path fillRule="evenodd" d="M10 2C5.03 2 1 6.03 1 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM6.77 15.33c-.4.38-.85.68-1.34.9.48.22.99.37 1.51.45.52.08 1.06.12 1.61.12s1.09-.04 1.61-.12c.52-.08 1.03-.23 1.51-.45-.49-.22-.94-.52-1.34-.9-.38-.37-.66-.8-.81-1.28-.15-.48-.23-.99-.23-1.51s.08-1.03.23-1.51c.15-.48.43-.91.81-1.28.4-.38.85-.68 1.34-.9-.48-.22-.99-.37-1.51-.45-.52-.08-1.06-.12-1.61-.12s-1.09.04-1.61.12c-.52.08-1.03.23-1.51.45.49.22.94.52 1.34.9.38.37.66.8.81 1.28.15.48.23.99.23 1.51s-.08 1.03-.23 1.51c-.15.48-.43.91-.81 1.28zm7.84-1.1c-.1-.91-.45-1.74-1-2.44v-1.58c1.4.98 2.26 2.53 2.26 4.23 0 .42-.05.83-.14 1.22h-1.12zM11.19 11c0-.68-.16-1.32-.44-1.89h-1.5c-.28.57-.44 1.21-.44 1.89s.16 1.32.44 1.89h1.5c.28-.57.44-1.21.44-1.89z" clipRule="evenodd" />
          </svg>
          Sign up with Google
        </button>

        {/* Optional: Link to Login */}
        <p className="mt-6 text-center text-sm">
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </button>
        </p>

        {/* TODO: Add other Social Login buttons */} 
      </div>
    </div>
  );
} 