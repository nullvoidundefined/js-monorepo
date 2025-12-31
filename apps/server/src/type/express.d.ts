import 'express-session';

declare global {
  namespace Express {
    // Make User type available in Express namespace for Passport
    interface User {
      id: string;
      email: string;
      name: string;
      createdAt: Date | string;
      updatedAt: Date | string;
      photo?: string;
    }

    interface Request {
      user?: User;
      logout(callback: (err: Error | null) => void): void;
      isAuthenticated(): boolean;
      session?: {
        destroy(callback: (err: Error | null) => void): void;
      };
      // Custom middleware properties
      apiVersion?: string;
      requestId?: string;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user?: Express.User;
    };
    // CSRF token for cross-site request forgery protection
    csrfToken?: string;
    // Session user data
    userId?: number;
    user?: {
      id: number;
      email: string;
      username: string;
      firstName?: string | null;
      lastName?: string | null;
      photo?: string | null;
      googleId?: string | null;
    };
  }
}
