'use client';

import { Component, ReactNode } from 'react';

import { Button } from '@packages/component-library';

import styles from './errorBoundary.module.scss';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch and handle React errors
 * Prevents the entire app from crashing when a component throws an error
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary';

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to console (could also send to error tracking service)
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ error: null, hasError: false });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorCard}>
            <h1 className={styles.errorTitle}>Oops! Something went wrong</h1>
            <p className={styles.errorMessage}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button variant="primary" onClick={this.handleReset}>
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

