import { NextFunction, Request, Response } from 'express';

/**
 * Middleware to check if user is authenticated
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({ error: 'Authentication required' });
  }
};

/**
 * Middleware to check if user is authenticated (optional)
 * Allows the request to proceed but provides user info if authenticated
 */
export const optionalAuth = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};

