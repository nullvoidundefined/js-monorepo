import crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';

/**
 * Request ID tracking middleware for distributed tracing
 * Generates or uses existing request ID from headers
 */
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Check if request already has an ID from upstream service or load balancer
  let requestId = req.headers['x-request-id'] as string;

  // If no ID exists, generate a new one
  if (!requestId) {
    // Generate a unique request ID using timestamp and random bytes
    const timestamp = Date.now().toString(36);
    const randomPart = crypto.randomBytes(8).toString('hex');
    requestId = `${timestamp}-${randomPart}`;
  }

  // Store request ID in headers for downstream services
  req.headers['x-request-id'] = requestId;

  // Add request ID to response headers for client-side debugging
  res.setHeader('X-Request-ID', requestId);

  // Make request ID easily accessible via a custom property
  req.requestId = requestId;

  next();
};


