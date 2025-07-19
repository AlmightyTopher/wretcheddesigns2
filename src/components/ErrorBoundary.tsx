"use client";

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    // Reset the error boundary and reload the page
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleReset = () => {
    // Just reset the error boundary without reloading
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
          <div className="max-w-md w-full bg-red-950/80 border border-red-500 rounded-lg p-6 text-center">
            <div className="mb-4">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">
                Something went wrong
              </h2>
              <p className="text-red-200 mb-4">
                We encountered an unexpected error. Our team has been notified.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors font-semibold"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors font-semibold"
              >
                Reload Page
              </button>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-red-300 hover:text-red-200 font-semibold">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-red-900/50 rounded text-xs font-mono text-red-100 overflow-auto max-h-40">
                  <strong>Error:</strong> {this.state.error.message}
                  <br />
                  <strong>Stack:</strong>
                  <pre className="mt-1 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
