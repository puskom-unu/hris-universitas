import React, { ErrorInfo } from 'react';
import { logError } from '../../utils/logging';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">Terjadi kesalahan yang tidak terduga.</div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
