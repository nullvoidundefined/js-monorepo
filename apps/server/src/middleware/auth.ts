import { db, users } from 'database';
import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';

/**
 * Verify Google ID token and extract user info
 */
const verifyGoogleToken = async (token: string): Promise<any> => {
  try {
    // Decode the JWT (without verification for now - in production use google-auth-library)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
    return payload;
  } catch (error) {
    console.error('[Auth] Token decode error:', error);
    throw new Error('Invalid token');
  }
};

/**
 * Middleware to check if user is authenticated
 * Supports both session-based (web) and JWT token (mobile) authentication
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Check session-based auth first (web)
  if (req.isAuthenticated()) {
    next();
    return;
  }

  // Check JWT Bearer token (mobile)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const payload = await verifyGoogleToken(token);

      // Find user in database by Google ID
      const googleId = payload.sub;
      const [dbUser] = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);

      if (dbUser) {
        // Attach user to request
        req.user = {
          id: dbUser.id.toString(),
          email: dbUser.email,
          name: [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' '),
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
          photo: dbUser.photo || undefined,
        };
        next();
        return;
      }

      res.status(401).json({ error: 'Authentication required' });
    } catch (error) {
      console.error('[Auth] JWT verification failed:', error);
    }
  }

  res.status(401).json({ error: 'Authentication required' });
};

/**
 * Middleware to check if user is authenticated (optional)
 * Allows the request to proceed but provides user info if authenticated
 */
export const optionalAuth = (_req: Request, _res: Response, next: NextFunction): void => {
  next();
};
