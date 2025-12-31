import { NextFunction, Request, Response } from 'express';

/**
 * Request logging middleware
 * Logs HTTP requests with timing and status information
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || 'no-id';

  // Log incoming request
  const logRequest = () => {
    const method = req.method;
    const url = req.originalUrl || req.url;
    const userAgent = req.headers['user-agent'] || 'unknown';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (process.env.NODE_ENV !== 'production') {
      console.log(
        `[${new Date().toISOString()}] [${requestId}] ${method} ${url} - User-Agent: ${userAgent} - IP: ${ip}`
      );
    }
  };

  // Log response when finished
  const originalSend = res.send;
  res.send = function (data): Response {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    const method = req.method;
    const url = req.originalUrl || req.url;

    // Different log levels based on status code
    if (statusCode >= 500) {
      console.error(
        `[${new Date().toISOString()}] [${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms - ERROR`
      );
    } else if (statusCode >= 400) {
      console.warn(
        `[${new Date().toISOString()}] [${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms - WARNING`
      );
    } else {
      console.log(
        `[${new Date().toISOString()}] [${requestId}] ${method} ${url} - ${statusCode} - ${duration}ms`
      );
    }

    // In production, you might want to send these logs to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Example: Log to external service
      // logToExternalService({ requestId, method, url, statusCode, duration });
    }

    return originalSend.call(this, data);
  };

  logRequest();
  next();
};

/**
 * Error logging middleware
 * Should be used alongside the error handler
 */
export const errorLogger = (err: Error, req: Request, _res: Response, next: NextFunction): void => {
  const requestId = req.headers['x-request-id'] || 'no-id';
  const method = req.method;
  const url = req.originalUrl || req.url;

  console.error(`[${new Date().toISOString()}] [${requestId}] ERROR - ${method} ${url}`);
  console.error(`Error: ${err.message}`);

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  next(err);
};
