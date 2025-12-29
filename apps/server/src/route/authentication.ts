import { db, users } from 'database';
import { eq } from 'drizzle-orm';
import { Request, Response, Router } from 'express';
import passport from 'passport';
import { Profile, Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';

const authRouter = Router();

// Google OAuth configuration from environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    'Missing required Google OAuth environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set'
  );
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
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
        const displayName = profile.displayName || '';
        const email = profile.emails?.[0]?.value;
        const googleId = profile.id;
        const photo = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // 1. Check if user exists in database by Google ID
        const existingUser = await db
          .select()
          .from(users)
          .where(eq(users.googleId, googleId))
          .limit(1);

        let dbUser;

        if (existingUser.length > 0) {
          // 3. Update existing user if needed
          const [updatedUser] = await db
            .update(users)
            .set({
              email,
              firstName: displayName.split(' ')[0] || displayName,
              lastName: displayName.split(' ').slice(1).join(' ') || null,
              photo,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser[0].id))
            .returning();

          dbUser = updatedUser;
        } else {
          // 2. Create new user if they don't exist
          // Generate a unique username from email
          const username = email.split('@')[0] + '_' + Date.now();

          const [newUser] = await db
            .insert(users)
            .values({
              googleId,
              email,
              username,
              firstName: displayName.split(' ')[0] || displayName,
              lastName: displayName.split(' ').slice(1).join(' ') || null,
              photo,
              password: null, // OAuth users don't have passwords
            })
            .returning();

          dbUser = newUser;
        }

        const user: Express.User = {
          id: dbUser.id.toString(),
          email: dbUser.email,
          name: [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' '),
          createdAt: dbUser.createdAt,
          updatedAt: dbUser.updatedAt,
          photo: dbUser.photo || undefined,
        };

        return done(null, user);
      } catch (error) {
        console.error('Authentication error:', error);
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
