import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppErrorFallback } from './AppErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    // Attempt to refresh window or trigger context reload
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleContinueLocal = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <AppErrorFallback
          title="Something interrupted Aapka Saathi"
          message="A unexpected issue occurred while rendering the companion screen. Your data and settings are safely preserved."
          errorDetails={this.state.error?.message}
          onRetry={this.handleRetry}
          onContinueLocal={this.handleContinueLocal}
        />
      );
    }

    return this.props.children;
  }
}
