# Google OAuth Authentication Setup

## Overview
The client application has been updated to use Google OAuth authentication with the backend server.

## Changes Made

### 1. Authentication Library (`src/lib/auth.ts`)
- **`loginWithGoogle()`**: Redirects user to backend OAuth endpoint
- **`getCurrentUser()`**: Fetches authenticated user from backend
- **`isAuthenticated()`**: Checks if user is authenticated
- **`logout()`**: Logs out user via backend endpoint

### 2. Login Page (`src/app/login/page.tsx`)
- Replaced email/password form with Google OAuth button
- Auto-redirects if user is already authenticated
- Modern UI with Google branding

### 3. Protected Routes (`src/components/ProtectedRoute.tsx`)
- Updated to use async authentication check
- Works with backend session management

### 4. Home Page (`src/app/page.tsx`)
- Fetches real user data from backend
- Displays authenticated user information
- Async logout functionality

## Environment Variables

Create a `.env.local` file in the `apps/client-web` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production, set this to your backend API URL.

## Usage

### Starting the Application

1. Start the backend server:
   ```bash
   cd apps/server
   npm run dev
   ```

2. Start the frontend:
   ```bash
   cd apps/client-web
   npm run dev
   ```

3. Visit `http://localhost:3000` in your browser

### Authentication Flow

1. User visits the application
2. If not authenticated, redirected to `/login`
3. User clicks "Sign in with Google"
4. Redirected to Google OAuth consent screen
5. After consent, Google redirects to backend (`/api/auth/google/callback`)
6. Backend creates session and redirects to frontend
7. Frontend fetches user data and displays protected content

### API Endpoints Used

- `GET /api/auth/google` - Initiates OAuth flow
- `GET /api/auth/google/callback` - OAuth callback (handled by backend)
- `GET /api/auth/user` - Get current authenticated user
- `POST /api/auth/logout` - Logout user

## Important Notes

- Sessions are managed by the backend using `express-session`
- Cookies are sent with credentials: 'include' for cross-origin requests
- The application uses Google OAuth 2.0 with the provided client credentials
- User data includes: id, email, name, and photo (from Google profile)

## Security Considerations

- In production, use HTTPS for all requests
- Set `SESSION_SECRET` environment variable on the backend
- Configure `CLIENT_URL` to match your frontend domain
- Enable secure cookies in production environments
- Add the production callback URL to Google Cloud Console OAuth settings

