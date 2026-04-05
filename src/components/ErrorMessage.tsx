import { AlertCircle, WifiOff, ServerCrash, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

interface ErrorMessageProps {
  error: Error | string;
  retry?: () => void;
  className?: string;
}

/**
 * Get user-friendly error message from error object
 */
function getErrorMessage(error: Error | string): { title: string; message: string; icon: any } {
  const errorString = typeof error === 'string' ? error : error.message;
  
  // Network errors
  if (errorString.includes('fetch') || errorString.includes('network') || errorString.includes('Failed to fetch')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      icon: WifiOff,
    };
  }
  
  // Rate limit errors
  if (errorString.includes('rate limit') || errorString.includes('429')) {
    return {
      title: 'Too Many Requests',
      message: 'You\'re making requests too quickly. Please wait a moment and try again.',
      icon: AlertTriangle,
    };
  }
  
  // API errors
  if (errorString.includes('API') || errorString.includes('provider')) {
    return {
      title: 'Service Error',
      message: 'One of our services is temporarily unavailable. Please try again later.',
      icon: ServerCrash,
    };
  }
  
  // Validation errors
  if (errorString.includes('validation') || errorString.includes('invalid')) {
    return {
      title: 'Invalid Input',
      message: errorString,
      icon: AlertCircle,
    };
  }
  
  // Default error
  return {
    title: 'Something went wrong',
    message: errorString || 'An unexpected error occurred. Please try again.',
    icon: AlertCircle,
  };
}

/**
 * Error Message Component
 * Displays user-friendly error messages
 */
export function ErrorMessage({ error, retry, className }: ErrorMessageProps) {
  const { title, message, icon: Icon } = getErrorMessage(error);
  
  return (
    <Alert variant="destructive" className={className}>
      <Icon className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {retry && (
          <div className="mt-4">
            <Button onClick={retry} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * Inline error message (smaller, for forms)
 */
export function InlineError({ error, className }: { error: string; className?: string }) {
  return (
    <div className={`text-sm text-destructive flex items-center gap-2 ${className}`}>
      <AlertCircle className="h-4 w-4" />
      <span>{error}</span>
    </div>
  );
}
