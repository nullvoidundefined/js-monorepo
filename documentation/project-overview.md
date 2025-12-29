# Project Overview

## Overview

A JavaScript/TypeScript monorepo built with Turborepo and Turbopack, designed for scalable full-stack development with integrated authentication and database.

## Project Structure

```
js-monorepo/
├── apps/                           # Applications
│   ├── client-web/                 # Next.js frontend
│   ├── server/                     # Express.js backend
│   └── database/                   # Database configuration
├── packages/                       # Shared packages
│   ├── shared/                     # Shared types and utilities
│   ├── eslint-config-custom/       # ESLint configurations
│   └── tsconfig/                   # TypeScript configurations
├── documentation/                  # Project documentation
├── package.json                    # Root package.json
└── turbo.json                      # Turborepo configuration
```

## Technology Stack

### Build System
- **Turborepo**: High-performance build system for monorepos
- **Turbopack**: Fast bundler for Next.js (via `--turbo` flag)
- **TypeScript**: Static type checking across all packages

### Frontend (client-web)
- **Framework**: Next.js 14 with App Router
- **UI**: React 18
- **Styling**: CSS (extensible to Tailwind, CSS Modules, etc.)
- **Testing**: Jest + React Testing Library
- **Features**:
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - Turbopack for fast dev builds
  - Google OAuth authentication
  - Protected routes

### Backend (server)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Authentication**: Passport.js with Google OAuth 2.0
- **Session Management**: express-session with in-memory store
- **Development**: tsx for hot reloading
- **Testing**: Jest + Supertest
- **Features**:
  - RESTful API endpoints
  - Type-safe request/response handling
  - Database integration with Drizzle ORM
  - Health check endpoint
  - CORS configuration for frontend

### Database
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (type-safe, lightweight)
- **Migrations**: Drizzle Kit
- **Features**:
  - Type-safe database queries
  - Automatic migration generation
  - Database seeding
  - Visual database browser (Drizzle Studio)
  - User authentication table with Google OAuth support

### Shared Packages

#### @application/shared
- Shared TypeScript types and interfaces
- Common utilities and helpers
- Exports: `User` type

#### eslint-config-custom
- Shared ESLint configurations
- Base config for all packages
- React-specific config for frontend apps

#### tsconfig
- Base TypeScript configurations
- Specialized configs for Next.js, Node.js, and React libraries

## Detailed Application Structure

### apps/client-web (Next.js Frontend)

```
apps/client-web/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page
│   │   └── login/
│   │       └── page.tsx            # Login page
│   ├── component/                  # React components
│   │   ├── __tests__/
│   │   │   └── UserCard.test.tsx   # Component tests
│   │   ├── ProtectedRoute.tsx      # Auth guard component
│   │   └── UserCard.tsx            # User card component
│   ├── lib/
│   │   └── auth.ts                 # Authentication utilities
│   └── styles/
│       └── globals.css             # Global styles
├── public/
│   └── favicon.svg                 # Favicon
├── .env.local                      # Environment variables (not in git)
├── jest.config.js                  # Jest configuration
├── jest.setup.js                   # Jest setup
├── next.config.js                  # Next.js configuration
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

**Key Files:**
- `src/app/page.tsx` - Main application page with user list
- `src/app/login/page.tsx` - Google OAuth login page
- `src/component/ProtectedRoute.tsx` - HOC for protected routes
- `src/lib/auth.ts` - Auth helper functions (login, logout, getCurrentUser)

### apps/server (Express.js Backend)

```
apps/server/
├── src/
│   ├── __tests__/
│   │   └── index.test.ts           # Server tests
│   ├── route/                      # Route handlers
│   │   ├── authentication.ts       # Auth routes (Google OAuth)
│   │   └── user.ts                 # User routes
│   ├── type/
│   │   └── express.d.ts            # Express type extensions
│   └── index.ts                    # Server entry point
├── .env                            # Environment variables (not in git)
├── jest.config.js                  # Jest configuration
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

**Key Files:**
- `src/index.ts` - Express server setup with Passport and session
- `src/route/authentication.ts` - Google OAuth routes and Passport config
- `src/route/user.ts` - User API endpoints
- `src/type/express.d.ts` - Custom type definitions for Express

### apps/database (Database Configuration)

```
apps/database/
├── src/
│   ├── schema/                     # Database schemas
│   │   ├── users.ts                # User table schema
│   │   └── index.ts                # Schema exports
│   ├── migrations/                 # Generated SQL migrations
│   │   ├── 0000_*.sql
│   │   ├── 0001_*.sql
│   │   └── meta/                   # Migration metadata
│   ├── index.ts                    # Database client export
│   ├── migrate.ts                  # Migration runner
│   └── seed.ts                     # Seed data script
├── scripts/
│   └── init-db.sh                  # Database initialization script
├── .env                            # Environment variables (not in git)
├── env.example                     # Environment template
├── drizzle.config.ts               # Drizzle configuration
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

**Key Files:**
- `src/schema/users.ts` - User table definition with Google OAuth support
- `src/index.ts` - Exports `db` client and all schemas
- `src/migrate.ts` - Applies migrations to database
- `src/seed.ts` - Sample data for development

### packages/shared

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── __tests__/
│   │   │   └── user.test.ts        # Type tests
│   │   └── index.ts                # Type definitions
│   └── index.ts                    # Package exports
├── jest.config.js                  # Jest configuration
├── package.json                    # Dependencies and scripts
└── tsconfig.json                   # TypeScript configuration
```

**Exports:**
- `User` type - Shared user interface used across apps

## Path Aliases

All packages use the `@application/` prefix for imports:

### Global Aliases

These aliases work across all applications:

```typescript
import { User } from '@application/shared';
import { type User } from '@application/types';
```

### client-web Aliases

```typescript
// Configured in apps/client-web/tsconfig.json
import { auth } from '@application/lib/auth';
import '@application/styles/globals.css';
```

**Note:** The source uses `src/component/` (singular, not `components/`). No `@application/components` alias is configured.

### server Aliases

Currently uses relative imports:

```typescript
// No aliases configured, use relative paths
import { authRouter } from './route/authentication';
import { userRouter } from './route/user';
```

**Note:** The server uses `src/route/` (not `routes/`)

### database Aliases

Exports from main index:

```typescript
// Import from the package root
import { db, users } from 'database';
```

**Note:** The database exports `db` client and schema from `src/index.ts`

## Authentication Flow

The application uses Passport.js with Google OAuth 2.0 strategy:

1. User clicks "Sign in with Google" on frontend
2. Frontend redirects to `/api/auth/google`
3. Server initiates OAuth flow with Google
4. User authenticates with Google
5. Google redirects to `/api/auth/google/callback`
6. Server creates/updates user in database
7. Server creates session and redirects to frontend
8. Frontend fetches user data via `/api/auth/user`
9. User accesses protected routes

### Key Endpoints

- `GET /api/auth/google` - Initiate OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/user` - Get current user
- `POST /api/auth/logout` - Logout

### Database Integration

- Users are stored in PostgreSQL `users` table
- Supports both OAuth users (via `googleId`) and password users
- OAuth users have `password` field set to `null`

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up database (first time only)
cd apps/database
./scripts/init-db.sh
npm run db:generate
npm run db:migrate
cd ../..

# Run all apps in development mode
npm run dev

# Or run specific apps
cd apps/client-web && npm run dev  # Frontend on :3000
cd apps/server && npm run dev       # Backend on :3001
```

### Building

```bash
# Build all packages
npm run build

# Turborepo will:
# 1. Build packages in dependency order
# 2. Cache builds for unchanged packages
# 3. Run builds in parallel when possible
```

### Testing

```bash
# Run all tests
npm run test

# Tests include:
# - Unit tests for shared types
# - Component tests for React components
# - API endpoint tests for server
```

Each application includes tests:
- **client-web**: Component tests with React Testing Library
- **server**: API endpoint tests with Supertest
- **shared**: Type validation tests
- **database**: No tests currently (schema validation via TypeScript)

### Linting & Formatting

```bash
# Lint all packages
npm run lint

# Format all files
npm run format

# Check formatting
npm run format:check
```

## Type Safety

### Shared Types

The `@application/shared` package provides type definitions used across all applications:

```typescript
import { User } from '@application/shared';

const user: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Database Types

Database schema automatically generates TypeScript types:

```typescript
import { type User, type NewUser } from 'database';

// User - for select queries (includes all fields)
// NewUser - for insert queries (excludes auto-generated fields)
```

### Type Checking
- All packages use `strict: true` in TypeScript
- No implicit `any` types
- Unused variables and parameters are flagged

## Common Commands

### Root Level

```bash
# Install all dependencies
npm install

# Run all apps in development
npm run dev

# Build all packages
npm run build

# Run all tests
npm run test

# Lint all code
npm run lint

# Format all code
npm run format

# Database commands (from root)
npm run db:generate          # Generate migrations
npm run db:migrate           # Run migrations
npm run db:push              # Push schema (dev only)
npm run db:studio            # Open Drizzle Studio
npm run db:seed              # Seed database
```

### Application Specific

```bash
# Frontend (client-web)
cd apps/client-web
npm run dev                 # Start dev server (:3000)
npm run build               # Build for production
npm run start               # Start production server
npm run test                # Run tests

# Backend (server)
cd apps/server
npm run dev                 # Start dev server (:3001)
npm run build               # Build for production
npm run start               # Start production server
npm run test                # Run tests

# Database
cd apps/database
npm run db:generate         # Generate migrations
npm run db:migrate          # Run migrations
npm run db:push             # Push schema changes
npm run db:studio           # Open database GUI
npm run db:seed             # Seed sample data
```

## Environment Variables

### apps/client-web/.env.local

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### apps/server/.env

```bash
PORT=3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your_random_secret_key
```

### apps/database/.env

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev
```

## Adding New Code

### Adding a New Component (client-web)

```bash
# Create component file
touch apps/client-web/src/component/NewComponent.tsx

# Create test file
touch apps/client-web/src/component/__tests__/NewComponent.test.tsx
```

### Adding a New Route (server)

```bash
# Create route file
touch apps/server/src/route/new-route.ts

# Import in src/index.ts
```

### Adding a New Database Table

```bash
# Create schema file
touch apps/database/src/schema/posts.ts

# Export from src/schema/index.ts
# Generate migration
npm run db:generate

# Apply migration
npm run db:migrate
```

### Adding a New Shared Type

```bash
# Edit packages/shared/src/types/index.ts
# Export from packages/shared/src/index.ts
```

## Build Output

### client-web
- `.next/` - Next.js build output (gitignored)
- Built and optimized for production with `npm run build`

### server
- `dist/` - Compiled TypeScript output (gitignored)
- Built with TypeScript compiler

### database
- `dist/` - Compiled TypeScript output (gitignored)
- Migrations in `src/migrations/` (committed to git)

### shared
- `dist/` - Compiled package for consumption by other apps

## Deployment Considerations

### client-web (Next.js)
- Deploy to Vercel, Netlify, or any Node.js host
- Supports static export or server-side rendering
- Set `NEXT_PUBLIC_API_URL` to production API URL
- Enable CORS on backend for production domain

### server (Node.js)
- Deploy to any Node.js hosting platform (Railway, Render, Heroku, etc.)
- Requires Node.js 18+ runtime
- Set all environment variables (Google OAuth, database, session secret)
- Configure allowed origins for CORS
- Use secure session cookies in production

### database
- Use managed PostgreSQL (AWS RDS, Heroku Postgres, Supabase, Railway, Neon)
- Update `DATABASE_URL` with production credentials
- Enable SSL: `?sslmode=require` in connection string
- Run migrations as part of deployment: `npm run db:migrate`
- Set up automated backups
- Consider connection pooling for high traffic

## Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **Session Management**: Use secure session secrets in production
3. **CORS**: Configure allowed origins properly
4. **Database**: Use SSL connections in production
5. **OAuth**: Keep client secrets secure
6. **Passwords**: Always hash with bcrypt (salt rounds ≥ 10)
7. **HTTPS**: Use HTTPS in production for all services
8. **Dependencies**: Regularly update and audit packages

## Monitoring & Debugging

### Health Checks

The server includes a health check endpoint:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-12-29T..."
}
```

### Logging

- Server logs to console (use logging service in production)
- Database queries can be logged via Drizzle config
- Frontend errors can be caught with error boundaries

## Troubleshooting

### Build Issues
- Clear Turbo cache: `rm -rf .turbo`
- Clear Next.js cache: `rm -rf apps/client-web/.next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

### Type Errors
- Ensure all packages are built: `npm run build`
- Check path mappings in `tsconfig.json`
- Verify workspace dependencies in `package.json`

### Test Failures
- Clear Jest cache: `npx jest --clearCache`
- Check module name mappings in `jest.config.js`
- Ensure test environment is correct (jsdom vs node)

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `psql -l`
- Check migrations are up to date: `npm run db:migrate`

### Authentication Issues
- Verify Google OAuth credentials are set
- Check callback URL matches Google Console configuration
- Ensure session secret is set
- Verify CORS settings allow credentials

## Additional Resources

- [authentication.md](./authentication.md) - Authentication setup guide
- [database-overview.md](./database-overview.md) - Database quick start
- [database-setup.md](./database-setup.md) - Detailed database setup
- [database-usage.md](./database-usage.md) - Database code examples

