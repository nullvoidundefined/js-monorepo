# Contributing Guide

Thank you for contributing to this monorepo!

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development**
   ```bash
   npm run dev
   ```

## Development Workflow

### Path Aliases

All internal imports use the `@application/` prefix to avoid relative paths:

```typescript
// ✅ Good
import { User } from '@application/shared';
import { UserCard } from '@application/components/UserCard';

// ❌ Avoid
import { User } from '../../packages/shared/src';
import { UserCard } from '../components/UserCard';
```

### Adding New Features

1. Create a new branch from `main`
2. Make your changes
3. Run tests: `npm run test`
4. Run linting: `npm run lint`
5. Format code: `npm run format`
6. Submit a pull request

### Code Style

- Follow the ESLint and Prettier configurations
- Write unit tests for new features
- Use TypeScript for type safety
- Document complex logic with comments

### Testing

Each package has its own test suite:

```bash
# Run all tests
npm run test

# Run tests for a specific package
cd apps/client-web && npm run test
cd apps/server && npm run test
cd packages/shared && npm run test
```

### Monorepo Structure

```
apps/
  client-web/    - Next.js frontend application
  server/        - Express.js backend server
  database/      - Database migrations and seeds

packages/
  shared/        - Shared types and utilities
  eslint-config-custom/  - Shared ESLint configuration
  tsconfig/      - Shared TypeScript configurations
```

### Adding Dependencies

- **For workspace dependencies**: Add to root `package.json`
- **For app-specific dependencies**: Add to the app's `package.json`
- **For shared dependencies**: Consider adding to `packages/shared`

### Turborepo

This monorepo uses Turborepo for efficient builds and caching:

- Builds are cached and only rebuild what's changed
- Dependencies are built in the correct order
- Tasks run in parallel when possible

## Questions?

Feel free to open an issue for any questions or concerns.

