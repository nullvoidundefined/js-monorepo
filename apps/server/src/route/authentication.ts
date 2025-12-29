import { Request, Response, Router } from 'express';
import passport from 'passport';
import { Profile, Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';

const authRouter = Router();

// Google OAuth configuration
// TODO: Move to environment variables
const GOOGLE_CLIENT_ID = '***REMOVED***';
const GOOGLE_CLIENT_SECRET = '***REMOVED***';
const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback';

// Configure Passport with Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        // TODO: Implement user creation and authentication logic
        // Here you would typically:
        // 1. Check if user exists in database
        // 2. Create new user if they don't exist
        // 3. Update existing user if needed

        const user: Express.User = {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName,
          photo: profile.photos?.[0]?.value,
        };

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

// Serialize user into session
passport.serializeUser(
  (user: Express.User, done: (err: Error | null, id?: Express.User) => void) => {
    done(null, user);
  }
);

// Deserialize user from session
passport.deserializeUser(
  (user: Express.User, done: (err: Error | null, user?: Express.User | false) => void) => {
    done(null, user);
  }
);

// Route to initiate Google OAuth login
authRouter.get(
  '/api/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Google OAuth callback route
authRouter.get(
  '/api/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: true,
  }),
  (_req: Request, res: Response) => {
    // Successful authentication
    // Redirect to client app or send user data
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);

// Logout route
authRouter.post('/api/auth/logout', (req: Request, res: Response) => {
  req.logout((err: Error | null) => {
    if (err) {
      res.status(500).json({ error: 'Failed to logout' });
      return;
    }
    if (req.session) {
      req.session.destroy((error: Error | null) => {
        if (error) {
          res.status(500).json({ error: 'Failed to destroy session' });
          return;
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    } else {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    }
  });
});

// Get current user route
authRouter.get('/api/auth/user', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

export { authRouter, passport };
