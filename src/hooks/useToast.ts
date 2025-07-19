"use client";

import { useState, useCallback } from 'react';
import { ToastMessage, ToastType } from '../components/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const showSuccess = useCallback((title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ ...options, type: 'success', title, message });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ ...options, type: 'error', title, message });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ ...options, type: 'warning', title, message });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, options?: Partial<ToastMessage>) => {
    return addToast({ ...options, type: 'info', title, message });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};
