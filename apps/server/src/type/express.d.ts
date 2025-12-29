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
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    passport?: {
      user?: Express.User;
    };
  }
}
