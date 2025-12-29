# Architecture Documentation

## Overview

This is a JavaScript/TypeScript monorepo built with Turborepo and Turbopack, designed for scalable full-stack development.

## Technology Stack

### Build System
- **Turborepo**: High-performance build system for monorepos
- **Turbopack**: Fast bundler for Next.js (via `--turbo` flag)
- **TypeScript**: Static type checking across all packages

### Applications

#### client-web (Next.js)
- **Framework**: Next.js 14 with App Router
- **UI**: React 18
- **Styling**: CSS (extensible to Tailwind, CSS Modules, etc.)
- **Testing**: Jest + React Testing Library
- **Features**:
  - Server-side rendering (SSR)
  - Static site generation (SSG)
  - API routes
  - Turbopack for fast dev builds

#### server (Node.js/Express)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Development**: tsx for hot reloading
- **Testing**: Jest + Supertest
- **Features**:
  - RESTful API endpoints
  - Type-safe request/response handling
  - Health check endpoint

#### database
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (type-safe, lightweight)
- **Migrations**: Drizzle Kit
- **Features**:
  - Type-safe database queries
  - Automatic migration generation
  - Database seeding
  - Visual database browser (Drizzle Studio)

### Packages

#### @application/shared
- Shared TypeScript types and interfaces
- Common utilities and helpers
- Currently exports: `User` type

#### eslint-config-custom
- Shared ESLint configurations
- Base config for all packages
- React-specific config for frontend apps

#### tsconfig
- Base TypeScript configurations
- Specialized configs for Next.js, Node.js, and React libraries

## Path Aliases

All packages use the `@application/` prefix for imports:

### Global Aliases
- `@application/shared` → Shared package
- `@application/types` → Shared types from shared package

### client-web Aliases
- `@application/components/*` → Components directory
- `@application/lib/*` → Library utilities
- `@application/styles/*` → Style files

### server Aliases
- `@application/controllers/*` → Controller files
- `@application/routes/*` → Route definitions
- `@application/middleware/*` → Middleware functions
- `@application/utils/*` → Utility functions

### database Aliases
- `@application/migrations/*` → Database migrations
- `@application/seeds/*` → Database seeds

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Set up database (first time only)
cd apps/database
./scripts/init-db.sh  # or manually create database
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
cd ../..

# Run all apps in development mode
npm run dev

# Run specific app
cd apps/client-web && npm run dev
cd apps/server && npm run dev
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

# Tests run with Jest
# - Unit tests for shared types
# - Component tests for React components
# - API endpoint tests for server
```

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

### Path Mapping
TypeScript path mapping is configured in each `tsconfig.json` to resolve `@application/*` imports correctly.

### Type Checking
- All packages use `strict: true` in TypeScript
- No implicit `any` types
- Unused variables and parameters are flagged

## Deployment Considerations

### client-web (Next.js)
- Deploy to Vercel, Netlify, or any Node.js host
- Supports static export or server-side rendering
- Environment variables via `.env.local`

### server (Node.js)
- Deploy to any Node.js hosting platform
- Requires Node.js 18+ runtime
- Environment variables via `.env`

### Database
- PostgreSQL database with Drizzle ORM
- Update `DATABASE_URL` in production environment
- Run migrations: `npm run db:migrate`
- Use managed PostgreSQL services (AWS RDS, Heroku Postgres, Supabase, etc.)
- Enable SSL in production: `?sslmode=require` in connection string

## Adding New Packages

### Create a New App
```bash
mkdir -p apps/new-app
cd apps/new-app
npm init -y
# Add tsconfig.json, package.json scripts, etc.
```

### Create a New Package
```bash
mkdir -p packages/new-package
cd packages/new-package
npm init -y
# Add to workspace in root package.json
```

## Best Practices

1. **Use Path Aliases**: Always use `@application/*` imports
2. **Type Everything**: Leverage TypeScript for all code
3. **Test Coverage**: Write tests for new features
4. **Shared Code**: Put reusable code in `packages/shared`
5. **Environment Variables**: Use `.env` files (never commit secrets)
6. **Code Formatting**: Run Prettier before committing
7. **Linting**: Fix ESLint errors before committing

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

