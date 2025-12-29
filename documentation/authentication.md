# Authentication Guide

## Overview

The application uses Google OAuth 2.0 for authentication, implemented with Passport.js on the backend and session-based authentication.

## Technology Stack

- **Frontend**: Next.js with client-side auth utilities
- **Backend**: Express.js with Passport.js
- **Strategy**: Google OAuth 2.0 (passport-google-oauth20)
- **Session**: express-session with in-memory store
- **Database**: PostgreSQL with Drizzle ORM for user storage

## Architecture

### Authentication Flow

1. User visits the application
2. If not authenticated, redirected to `/login`
3. User clicks "Sign in with Google"
4. Frontend redirects to backend: `GET /api/auth/google`
5. Backend initiates OAuth flow with Google
6. User authenticates and grants permissions on Google
7. Google redirects to backend: `GET /api/auth/google/callback`
8. Backend:
   - Verifies OAuth response
   - Creates or updates user in database
   - Creates session
   - Redirects to frontend
9. Frontend fetches user data: `GET /api/auth/user`
10. User accesses protected content

### Session Management

- Sessions are managed by `express-session`
- Session data stored in memory (consider Redis for production)
- Cookies sent with `credentials: 'include'` for cross-origin requests
- Session expires on browser close or manual logout

## Setup Instructions

### 1. Create Google OAuth Application

**Step 1: Go to Google Cloud Console**

Visit [Google Cloud Console](https://console.cloud.google.com/)

**Step 2: Create a New Project**

- Click "Select a project" → "New Project"
- Name your project (e.g., "My Monorepo App")
- Click "Create"

**Step 3: Enable Google+ API**

- Navigate to "APIs & Services" → "Library"
- Search for "Google+ API"
- Click "Enable"

**Step 4: Create OAuth Credentials**

- Navigate to "APIs & Services" → "Credentials"
- Click "Create Credentials" → "OAuth client ID"
- Configure OAuth consent screen if prompted:
  - User Type: External
  - App name: Your app name
  - User support email: Your email
  - Developer contact: Your email
  - Save and continue
- Application type: "Web application"
- Name: "My App OAuth Client"
- Authorized JavaScript origins:
  - `http://localhost:3000` (frontend)
  - `http://localhost:3001` (backend)
- Authorized redirect URIs:
  - `http://localhost:3001/api/auth/google/callback`
- Click "Create"
- Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

**Backend (.env):**

```bash
# Server configuration
PORT=3001
NODE_ENV=development

# Google OAuth credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback

# Frontend URL
CLIENT_URL=http://localhost:3000

# Session secret (use a random string)
SESSION_SECRET=your_random_secret_key_here
```

Generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Frontend (.env.local):**

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Database Configuration

The `users` table includes Google OAuth support:

```typescript
// apps/database/src/schema/users.ts
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  googleId: varchar('google_id', { length: 255 }).unique(),  // Google user ID
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }),  // Null for OAuth users
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  photo: text('photo'),  // Google profile photo URL
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

Ensure migrations are up to date:
```bash
npm run db:migrate
```

## Backend Implementation

### Passport Configuration

**Location:** `apps/server/src/route/authentication.ts`

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { db, users } from 'database';
import { eq } from 'drizzle-orm';

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      // Find or create user in database
      const email = profile.emails?.[0]?.value;
      const googleId = profile.id;
      
      // Check if user exists
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.googleId, googleId))
        .limit(1);
      
      if (existingUser) {
        // Update existing user
        const [updated] = await db.update(users)
          .set({ email, photo: profile.photos?.[0]?.value })
          .where(eq(users.id, existingUser.id))
          .returning();
        return done(null, updated);
      } else {
        // Create new user
        const [newUser] = await db.insert(users)
          .values({
            googleId,
            email,
            username: email.split('@')[0] + '_' + Date.now(),
            password: null,  // OAuth users don't have passwords
            firstName: profile.displayName?.split(' ')[0],
            lastName: profile.displayName?.split(' ').slice(1).join(' '),
            photo: profile.photos?.[0]?.value,
          })
          .returning();
        return done(null, newUser);
      }
    }
  )
);

// Serialize user into session
passport.serializeUser((user, done) => done(null, user));

// Deserialize user from session
passport.deserializeUser((user, done) => done(null, user));
```

### API Endpoints

**1. Initiate OAuth Flow**

```typescript
GET /api/auth/google
```

Redirects user to Google OAuth consent screen.

**2. OAuth Callback**

```typescript
GET /api/auth/google/callback
```

Handles Google OAuth callback, creates session, redirects to frontend.

**3. Get Current User**

```typescript
GET /api/auth/user
```

Returns currently authenticated user or 401 if not authenticated.

**4. Logout**

```typescript
POST /api/auth/logout
```

Destroys session and clears cookies.

### Server Setup

**Location:** `apps/server/src/index.ts`

```typescript
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { authRouter } from './route/authentication';

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,  // Allow cookies
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
  },
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(authRouter);
```

## Frontend Implementation

### Authentication Utilities

**Location:** `apps/client-web/src/lib/auth.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function loginWithGoogle() {
  window.location.href = `${API_URL}/api/auth/google`;
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_URL}/api/auth/user`, {
      credentials: 'include',
    });
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}

export async function logout() {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

### Login Page

**Location:** `apps/client-web/src/app/login/page.tsx`

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithGoogle, isAuthenticated } from '@application/lib/auth';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if already authenticated
    isAuthenticated().then((auth) => {
      if (auth) {
        router.push('/');
      }
    });
  }, [router]);

  return (
    <main>
      <h1>Login</h1>
      <button onClick={loginWithGoogle}>
        Sign in with Google
      </button>
    </main>
  );
}
```

### Protected Routes

**Location:** `apps/client-web/src/component/ProtectedRoute.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@application/lib/auth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isAuthenticated().then((auth) => {
      if (!auth) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
```

## Usage Examples

### Protecting a Page

```typescript
import { ProtectedRoute } from 'src/component/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <h1>Dashboard</h1>
      <p>This content is protected</p>
    </ProtectedRoute>
  );
}
```

### Accessing User Data

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@application/lib/auth';
import { User } from '@application/shared';

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

### Logout Button

```typescript
import { useRouter } from 'next/navigation';
import { logout } from '@application/lib/auth';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Production Deployment

### Environment Variables

**Backend Production:**
```bash
GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
CLIENT_URL=https://yourdomain.com
SESSION_SECRET=your_secure_random_secret
NODE_ENV=production
```

**Frontend Production:**
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Google OAuth Console Updates

Add production URLs to Google Cloud Console:

**Authorized JavaScript origins:**
- `https://yourdomain.com`
- `https://api.yourdomain.com`

**Authorized redirect URIs:**
- `https://api.yourdomain.com/api/auth/google/callback`

### Security Checklist

- [ ] Use HTTPS for all production URLs
- [ ] Set `secure: true` for session cookies
- [ ] Use strong, random `SESSION_SECRET`
- [ ] Configure CORS to allow only your frontend domain
- [ ] Enable `httpOnly` cookies to prevent XSS
- [ ] Set appropriate `maxAge` for sessions
- [ ] Use environment variables (never commit secrets)
- [ ] Consider Redis for session storage in production
- [ ] Enable rate limiting on auth endpoints
- [ ] Monitor failed login attempts

## Session Storage

### Development (In-Memory)

Currently uses in-memory session storage (default for express-session).

**Pros:**
- Simple setup
- No external dependencies

**Cons:**
- Sessions lost on server restart
- Not suitable for multiple server instances

### Production (Redis - Recommended)

Install Redis session store:

```bash
cd apps/server
npm install connect-redis redis
```

Update server configuration:

```typescript
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.connect();

// Use Redis for sessions
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));
```

## Troubleshooting

### OAuth Errors

**Error: redirect_uri_mismatch**
- Verify redirect URI in Google Console matches `GOOGLE_CALLBACK_URL`
- Check for trailing slashes (must match exactly)

**Error: invalid_client**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Ensure credentials are for the correct Google Cloud project

### Session Issues

**Sessions not persisting**
- Check that `credentials: 'include'` is set in frontend fetch calls
- Verify CORS allows credentials
- Check browser console for cookie warnings

**User logged out unexpectedly**
- Check session expiration settings
- Verify Redis connection (if using Redis)
- Check server logs for session errors

### CORS Issues

**Credentials not being sent**
- Set `credentials: 'include'` in fetch options
- Configure CORS to allow credentials:
  ```typescript
  cors({ origin: CLIENT_URL, credentials: true })
  ```

## Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [express-session Documentation](https://github.com/expressjs/session)
- [architecture.md](./architecture.md) - System architecture
- [database-overview.md](./database-overview.md) - Database guide

