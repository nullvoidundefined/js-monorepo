import { NextFunction, Request, Response } from 'express';

/**
 * Error response type
 */
interface ErrorResponse {
  error: string;
  message?: string;
  stack?: string;
}

/**
 * Global error handler middleware
 * Should be added after all routes
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging (but sanitize in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err);
  } else {
    // In production, log to a proper logging service
    console.error('Error occurred:', {
      message: err.message,
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
    });
  }

  // Prepare error response
  const response: ErrorResponse = {
    error: 'Internal server error',
  };

  // In development, include error details
  if (process.env.NODE_ENV !== 'production') {
    response.message = err.message;
    response.stack = err.stack;
  }

  res.status(500).json(response);
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

