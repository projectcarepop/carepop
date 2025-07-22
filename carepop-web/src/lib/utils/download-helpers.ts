import { downloadMedicalDocument, downloadMedicalDocumentAdmin } from '@/services/api';

export interface DownloadOptions {
  recordId: string;
  accessToken: string;
  isAdmin?: boolean;
  maxRetries?: number;
  onStart?: () => void;
  onSuccess?: (fileName: string) => void;
  onError?: (error: DownloadError) => void;
  onFinally?: () => void;
}

export interface DownloadError {
  type: 'AUTH_ERROR' | 'NETWORK_ERROR' | 'FILE_NOT_FOUND' | 'PERMISSION_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  canRetry: boolean;
  originalError?: Error;
}

/**
 * Enhanced download function with comprehensive error handling and retry logic
 */
export async function downloadWithRetry(options: DownloadOptions): Promise<void> {
  const { 
    recordId, 
    accessToken, 
    isAdmin = false, 
    maxRetries = 2,
    onStart,
    onSuccess,
    onError,
    onFinally
  } = options;

  let lastError: DownloadError | null = null;
  
  onStart?.();
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DOWNLOAD_HELPER] Attempt ${attempt + 1}/${maxRetries + 1} for record ${recordId}`);
      
      const downloadFunction = isAdmin ? downloadMedicalDocumentAdmin : downloadMedicalDocument;
      const response = await downloadFunction(recordId, accessToken);
      
      // Trigger the actual download
      const link = document.createElement('a');
      link.href = response.downloadUrl;
      link.download = response.fileName || 'medical-document';
      link.target = '_blank';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`[DOWNLOAD_HELPER] Success on attempt ${attempt + 1} for record ${recordId}`);
      onSuccess?.(response.fileName || 'medical-document');
      return;
      
    } catch (error) {
      console.error(`[DOWNLOAD_HELPER] Attempt ${attempt + 1} failed for record ${recordId}:`, error);
      
      lastError = categorizeError(error as Error);
      
      // Don't retry for certain error types
      if (!lastError.canRetry || attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
      console.log(`[DOWNLOAD_HELPER] Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  if (lastError) {
    console.error(`[DOWNLOAD_HELPER] All attempts failed for record ${recordId}:`, lastError);
    onError?.(lastError);
  }
  
  onFinally?.();
}

/**
 * Categorize errors for better user messaging and retry logic
 */
function categorizeError(error: Error): DownloadError {
  const message = error.message.toLowerCase();
  
  // Authentication/Authorization errors
  if (message.includes('authentication') || message.includes('unauthorized') || message.includes('forbidden')) {
    return {
      type: 'AUTH_ERROR',
      message: 'Authentication required. Please log in again.',
      canRetry: false,
      originalError: error
    };
  }
  
  // Permission errors
  if (message.includes('permission') || message.includes('access denied') || message.includes('not found')) {
    return {
      type: 'PERMISSION_ERROR',
      message: 'You do not have permission to download this document.',
      canRetry: false,
      originalError: error
    };
  }
  
  // File not found errors
  if (message.includes('not found') || message.includes('document file not found')) {
    return {
      type: 'FILE_NOT_FOUND',
      message: 'The requested document could not be found.',
      canRetry: false,
      originalError: error
    };
  }
  
  // Network errors (retryable)
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network error occurred. Please check your connection and try again.',
      canRetry: true,
      originalError: error
    };
  }
  
  // Unknown errors (retryable)
  return {
    type: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred. Please try again.',
    canRetry: true,
    originalError: error
  };
}

/**
 * Get user-friendly error message with action suggestions
 */
export function getErrorMessage(error: DownloadError): { title: string; description: string; action?: string } {
  switch (error.type) {
    case 'AUTH_ERROR':
      return {
        title: 'Authentication Required',
        description: error.message,
        action: 'Please refresh the page and log in again.'
      };
      
    case 'PERMISSION_ERROR':
      return {
        title: 'Access Denied',
        description: error.message,
        action: 'Contact your administrator if you believe this is an error.'
      };
      
    case 'FILE_NOT_FOUND':
      return {
        title: 'Document Not Found',
        description: error.message,
        action: 'The document may have been moved or deleted.'
      };
      
    case 'NETWORK_ERROR':
      return {
        title: 'Connection Problem',
        description: error.message,
        action: 'Check your internet connection and try again.'
      };
      
    default:
      return {
        title: 'Download Failed',
        description: error.message,
        action: 'Please try again. If the problem persists, contact support.'
      };
  }
} 