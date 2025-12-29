# Database

PostgreSQL database configuration using Drizzle ORM with migrations and seeds.

## Tech Stack

- **PostgreSQL**: Relational database
- **Drizzle ORM**: Type-safe ORM for TypeScript
- **Drizzle Kit**: Migration and schema management tool

## Local Setup

### Prerequisites

1. Install PostgreSQL locally:
   - **macOS**: `brew install postgresql@15 && brew services start postgresql@15`
   - **Ubuntu/Debian**: `sudo apt install postgresql postgresql-contrib`
   - **Windows**: Download from https://www.postgresql.org/download/

2. Create a local database:
   ```bash
   psql postgres
   CREATE DATABASE myapp_dev;
   \q
   ```

### Configuration

1. Copy the environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your PostgreSQL credentials:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev
   ```

### Installation

```bash
npm install
```

### Database Commands

```bash
# Generate migrations from schema changes
npm run db:generate

# Run migrations
npm run db:migrate

# Push schema changes directly (dev only)
npm run db:push

# Open Drizzle Studio (database GUI)
npm run db:studio

# Seed the database with sample data
npm run db:seed
```

## Structure

```
src/
  schema/       - Database schema definitions
    users.ts    - User table schema
    index.ts    - Schema exports
  migrations/   - Generated SQL migrations
  index.ts      - Database client export
  migrate.ts    - Migration runner
  seed.ts       - Seed data script
```

## Usage in Other Apps

Import the database client in your server:

```typescript
import { db, users } from 'database';

// Query users
const allUsers = await db.select().from(users);

// Insert user
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  username: 'username',
  password: 'hashed_password',
}).returning();
```

## Production Migration

When moving to production:

1. Update `DATABASE_URL` in production environment
2. Run migrations: `npm run db:migrate`
3. Ensure connection string includes SSL: `?sslmode=require`
4. Consider using connection pooling (PgBouncer, etc.)

## Adding New Tables

1. Create new schema file in `src/schema/`
2. Export from `src/schema/index.ts`
3. Generate migration: `npm run db:generate`
4. Run migration: `npm run db:migrate`

