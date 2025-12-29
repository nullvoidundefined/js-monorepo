# JavaScript Monorepo

A modern JavaScript monorepo using Turborepo and Turbopack.

## Structure

- `apps/client-web` - Next.js/React web application
- `apps/server` - Node.js backend server
- `apps/database` - Database configuration and migrations
- `packages/shared` - Shared types and utilities

## Getting Started

```bash
# Install dependencies
npm install

# Run all apps in development mode
npm run dev

# Build all apps
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

## Path Aliases

All imports use the `@application/` prefix:
- `@application/shared` - Shared package
- `@application/types` - Shared types

## Tech Stack

- **Turborepo** - Monorepo build system
- **Turbopack** - Fast bundler for Next.js
- **Next.js** - React framework
- **TypeScript** - Type safety
- **Jest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

