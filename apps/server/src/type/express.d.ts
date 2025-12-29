import 'express-session';
import { User } from '@packages/type';

declare global {
  namespace Express {
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
