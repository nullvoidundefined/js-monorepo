import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

/**
 * Validation schema for user list query parameters
 */
export const userListQuerySchema = z.object({
  sortBy: z.enum(['name', 'email', 'id']).optional().default('name'),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Generic middleware factory for validating request query parameters
 */
export const validateQuery = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid request parameters',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        res.status(400).json({ error: 'Invalid request parameters' });
      }
    }
  };
};

/**
 * Generic middleware factory for validating request body
 */
export const validateBody = <T extends z.ZodTypeAny>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: 'Invalid request body',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        });
      } else {
        res.status(400).json({ error: 'Invalid request body' });
      }
    }
  };
};

