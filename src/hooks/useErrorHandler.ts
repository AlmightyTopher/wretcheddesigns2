"use client";

import { useCallback } from 'react';
import { useToastContext } from '../context/ToastContext';

interface ErrorOptions {
  showToast?: boolean;
  fallbackMessage?: string;
  logError?: boolean;
}

export const useErrorHandler = () => {
  const { showError } = useToastContext();

  const handleError = useCallback((
    error: unknown,
    context?: string,
    options: ErrorOptions = {}
  ) => {
    const {
      showToast = true,
      fallbackMessage = 'An unexpected error occurred',
      logError = true
    } = options;

    // Log error to console for debugging
    if (logError) {
      console.error(`Error in ${context || 'unknown context'}:`, error);
    }

    // Determine user-friendly error message
    let userMessage = fallbackMessage;
    let title = 'Error';

    if (error instanceof Error) {
      // Handle specific error types with user-friendly messages
      if (error.message.includes('fetch')) {
        title = 'Connection Error';
        userMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        title = 'Request Timeout';
        userMessage = 'The request took too long to complete. Please try again.';
      } else if (error.message.includes('unauthorized') || error.message.includes('401')) {
        title = 'Access Denied';
        userMessage = 'You are not authorized to perform this action.';
      } else if (error.message.includes('forbidden') || error.message.includes('403')) {
        title = 'Forbidden';
        userMessage = 'You do not have permission to access this resource.';
      } else if (error.message.includes('not found') || error.message.includes('404')) {
        title = 'Not Found';
        userMessage = 'The requested resource could not be found.';
      } else if (error.message.includes('validation')) {
        title = 'Validation Error';
        userMessage = 'Please check your input and try again.';
      } else if (error.message.includes('firebase') || error.message.includes('firestore')) {
        title = 'Database Error';
        userMessage = 'There was a problem accessing the database. Please try again later.';
      } else {
        // Use the error message if it's user-friendly, otherwise use fallback
        userMessage = error.message.length < 100 ? error.message : fallbackMessage;
      }
    } else if (typeof error === 'string') {
      userMessage = error;
    }

    // Show toast notification if requested
    if (showToast) {
      showError(title, userMessage, { duration: 7000 });
    }

    return { title, message: userMessage };
  }, [showError]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string,
    options?: ErrorOptions
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context, options);
      return null;
    }
  }, [handleError]);

  const wrapWithErrorHandling = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    context?: string,
    options?: ErrorOptions
  ): T => {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args);
        // Handle async functions
        if (result && typeof result.catch === 'function') {
          return result.catch((error: unknown) => {
            handleError(error, context, options);
            throw error; // Re-throw so calling code can handle if needed
          });
        }
        return result;
      } catch (error) {
        handleError(error, context, options);
        throw error; // Re-throw so calling code can handle if needed
      }
    }) as T;
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    wrapWithErrorHandling,
  };
};
