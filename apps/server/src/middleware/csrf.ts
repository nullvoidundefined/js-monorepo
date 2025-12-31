import crypto from 'crypto';

import { NextFunction, Request, Response } from 'express';

/**
 * Generate a CSRF token
 */
export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Middleware to generate and set CSRF token
 * Should be applied to routes that render forms or need CSRF protection
 */
export const setCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session) {
    res.status(500).json({ error: 'Session not initialized' });
    return;
  }

  // Generate token if it doesn't exist
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }

  // Set token in cookie for double-submit pattern
  res.cookie('XSRF-TOKEN', req.session.csrfToken, {
    httpOnly: false, // Must be accessible to client-side JavaScript
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  next();
};

/**
 * Middleware to verify CSRF token
 * Should be applied to state-changing routes (POST, PUT, DELETE, PATCH)
 */
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
  // Skip CSRF check for safe methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    next();
    return;
  }

  if (!req.session || !req.session.csrfToken) {
    res.status(403).json({ error: 'CSRF token not found in session' });
    return;
  }

  // Get token from header (preferred) or body
  const clientToken = req.headers['x-csrf-token'] || req.body._csrf;

  if (!clientToken || typeof clientToken !== 'string') {
    res.status(403).json({ error: 'CSRF token missing from request' });
    return;
  }

  // Compare tokens - use timing-safe comparison if same length, otherwise simple comparison
  const sessionToken = req.session.csrfToken;
  if (sessionToken.length !== clientToken.length) {
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  // Compare tokens using timing-safe comparison
  if (!crypto.timingSafeEqual(Buffer.from(sessionToken), Buffer.from(clientToken))) {
    res.status(403).json({ error: 'Invalid CSRF token' });
    return;
  }

  next();
};

/**
 * Get CSRF token endpoint
 * Clients can call this to get a fresh CSRF token
 */
export const getCsrfToken = (req: Request, res: Response): void => {
  if (!req.session || !req.session.csrfToken) {
    res.status(500).json({ error: 'CSRF token not available' });
    return;
  }

  res.json({ csrfToken: req.session.csrfToken });
};

