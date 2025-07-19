"use client";

import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ id, type, title, message, duration = 5000, action, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Wait for exit animation
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500 text-green-100';
      case 'error':
        return 'bg-red-900/90 border-red-500 text-red-100';
      case 'warning':
        return 'bg-yellow-900/90 border-yellow-500 text-yellow-100';
      case 'info':
        return 'bg-blue-900/90 border-blue-500 text-blue-100';
      default:
        return 'bg-gray-900/90 border-gray-500 text-gray-100';
    }
  };

  return (
    <div
      className={`
        fixed z-50 max-w-sm w-full border rounded-lg shadow-lg p-4 transition-all duration-300 ease-in-out
        ${getTypeStyles()}
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0' : ''}
      `}
      style={{
        right: '1rem',
        animation: isVisible && !isExiting ? 'slideInRight 0.3s ease-out' : undefined
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-xl flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          {message && (
            <p className="text-xs opacity-90 leading-relaxed">{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className="mt-2 text-xs underline hover:no-underline font-medium"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="text-lg hover:opacity-70 transition-opacity flex-shrink-0"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
