/**
 * Authentication Error Handling Utility
 * Provides user-friendly error messages and security-conscious error handling
 */

import { AuthError } from '@supabase/supabase-js';

export type AuthErrorType = 
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'user_not_found'
  | 'signup_disabled'
  | 'email_address_invalid'
  | 'password_too_weak'
  | 'email_taken'
  | 'network_error'
  | 'rate_limit_exceeded'
  | 'oauth_error'
  | 'session_expired'
  | 'unknown_error';

interface AuthErrorInfo {
  type: AuthErrorType;
  userMessage: string;
  shouldRetry: boolean;
  requiresUserAction: boolean;
}

/**
 * Maps Supabase auth error messages to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, AuthErrorInfo> = {
  'Invalid login credentials': {
    type: 'invalid_credentials',
    userMessage: 'Email or password is incorrect. Please check your credentials and try again.',
    shouldRetry: true,
    requiresUserAction: true,
  },
  'Email not confirmed': {
    type: 'email_not_confirmed',
    userMessage: 'Please check your email and click the confirmation link before signing in.',
    shouldRetry: false,
    requiresUserAction: true,
  },
  'User not found': {
    type: 'user_not_found',
    userMessage: 'No account found with this email address. Please check your email or create a new account.',
    shouldRetry: true,
    requiresUserAction: true,
  },
  'Signup is disabled': {
    type: 'signup_disabled',
    userMessage: 'Account registration is currently disabled. Please try again later or contact support.',
    shouldRetry: false,
    requiresUserAction: false,
  },
  'Invalid email address': {
    type: 'email_address_invalid',
    userMessage: 'Please enter a valid email address.',
    shouldRetry: true,
    requiresUserAction: true,
  },
  'Password should be at least 6 characters': {
    type: 'password_too_weak',
    userMessage: 'Password must be at least 6 characters long.',
    shouldRetry: true,
    requiresUserAction: true,
  },
  'User already registered': {
    type: 'email_taken',
    userMessage: 'An account with this email already exists. Please sign in or use a different email.',
    shouldRetry: true,
    requiresUserAction: true,
  },
  'Failed to fetch': {
    type: 'network_error',
    userMessage: 'Network connection error. Please check your internet connection and try again.',
    shouldRetry: true,
    requiresUserAction: false,
  },
  'Too many requests': {
    type: 'rate_limit_exceeded',
    userMessage: 'Too many attempts. Please wait a few minutes before trying again.',
    shouldRetry: false,
    requiresUserAction: false,
  },
  'Access token has expired': {
    type: 'session_expired',
    userMessage: 'Your session has expired. Please sign in again.',
    shouldRetry: false,
    requiresUserAction: true,
  },
};

/**
 * OAuth specific error messages
 */
const OAUTH_ERROR_PATTERNS: Array<{ pattern: RegExp; info: AuthErrorInfo }> = [
  {
    pattern: /oauth.*error/i,
    info: {
      type: 'oauth_error',
      userMessage: 'Authentication with Google failed. Please try again or use email/password.',
      shouldRetry: true,
      requiresUserAction: true,
    },
  },
  {
    pattern: /unauthorized/i,
    info: {
      type: 'oauth_error',
      userMessage: 'Google authentication was not authorized. Please try again.',
      shouldRetry: true,
      requiresUserAction: true,
    },
  },
];

/**
 * Handles authentication errors and returns user-friendly information
 */
export function handleAuthError(error: unknown): AuthErrorInfo {
  let errorMessage = '';
  
  // Extract error message from various error types
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String((error as any).message);
  }

  // Check for exact matches first
  const exactMatch = ERROR_MESSAGE_MAP[errorMessage];
  if (exactMatch) {
    return exactMatch;
  }

  // Check for OAuth error patterns
  for (const { pattern, info } of OAUTH_ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return info;
    }
  }

  // Default fallback for unknown errors
  return {
    type: 'unknown_error',
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
    shouldRetry: true,
    requiresUserAction: false,
  };
}

/**
 * Security-conscious error logger that avoids logging sensitive information
 */
export function logAuthError(error: unknown, context: string): void {
  const errorInfo = handleAuthError(error);
  
  // Only log safe error information
  console.error(`Auth Error [${context}]:`, {
    type: errorInfo.type,
    shouldRetry: errorInfo.shouldRetry,
    requiresUserAction: errorInfo.requiresUserAction,
    timestamp: new Date().toISOString(),
  });

  // In development, log more details
  if (__DEV__) {
    console.error('Full error details (dev only):', error);
  }
}

/**
 * Validates if an error suggests the user should be signed out
 */
export function shouldSignOutOnError(error: unknown): boolean {
  const errorInfo = handleAuthError(error);
  return errorInfo.type === 'session_expired';
}

/**
 * Determines if the error is temporary and the user should retry automatically
 */
export function shouldRetryAutomatically(error: unknown): boolean {
  const errorInfo = handleAuthError(error);
  return errorInfo.type === 'network_error' || errorInfo.type === 'rate_limit_exceeded';
} 