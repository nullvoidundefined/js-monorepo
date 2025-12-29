# Quick Start Guide

Get up and running with the monorepo in 5 minutes.

## Prerequisites

- **Node.js**: 18 or higher
- **npm**: 9 or higher
- **PostgreSQL**: 15 or higher

## Installation

**1. Install Dependencies**

```bash
npm install
```

**2. Set Up Database**

```bash
cd apps/database
./scripts/init-db.sh
npm run db:migrate
cd ../..
```

**3. Configure Environment Variables**

Create the following environment files:

**apps/server/.env:**
```bash
PORT=3001
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
CLIENT_URL=http://localhost:3000
SESSION_SECRET=your_random_secret_key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev
```

**apps/client-web/.env.local:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**4. Start Development**

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## Common Commands

### Development

```bash
npm run dev              # Start all apps
npm run build            # Build all packages
npm run test             # Run all tests
npm run lint             # Lint all code
npm run format           # Format all code
```

### Database

```bash
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
npm run db:studio        # Open database GUI
npm run db:seed          # Seed sample data
```

### Working with Specific Apps

```bash
# Frontend
cd apps/client-web
npm run dev              # Start dev server (:3000)
npm run test             # Run tests

# Backend
cd apps/server
npm run dev              # Start dev server (:3001)
npm run test             # Run tests

# Database
cd apps/database
npm run db:studio        # Open database GUI
```

## Path Aliases

Use path aliases to avoid relative imports:

```typescript
// ✅ Good
import { User } from '@packages/type';
import { auth } from '@client-web/lib/auth';

// ❌ Avoid
import { UserCard } from '../../../component/UserCard';
```

## Adding New Code

### Add a Component

```bash
touch apps/client-web/src/component/NewComponent.tsx
touch apps/client-web/src/component/__tests__/NewComponent.test.tsx
```

### Add a Route

```bash
touch apps/server/src/route/new-route.ts
# Then import in apps/server/src/index.ts
```

### Add a Database Table

```bash
touch apps/database/src/schema/posts.ts
# Export from apps/database/src/schema/index.ts
npm run db:generate
npm run db:migrate
```

## Troubleshooting

### Database Won't Connect?

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql     # Linux
```

### Build Errors?

```bash
# Clear caches and reinstall
rm -rf .turbo
rm -rf apps/client-web/.next
rm -rf node_modules
npm install
```

### Type Errors?

```bash
# Rebuild all packages
npm run build
```

## Next Steps

For detailed documentation, see [README.md](./README.md).

