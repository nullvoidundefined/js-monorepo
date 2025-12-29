# Database Overview

PostgreSQL database with Drizzle ORM for type-safe database operations.

## Technology Stack

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM (type-safe, lightweight)
- **Migration Tool**: Drizzle Kit
- **Language**: TypeScript

## Quick Start

### Prerequisites

Node.js 18+ and PostgreSQL installed on your system.

### Installation Steps

**1. Install PostgreSQL**

```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu/Debian)
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/
```

**2. Create Database**

```bash
# Use the initialization script
cd apps/database
chmod +x scripts/init-db.sh
./scripts/init-db.sh

# OR manually
psql postgres -c "CREATE DATABASE myapp_dev;"
cd apps/database && cp env.example .env
```

**3. Install Dependencies & Run Migrations**

```bash
# From monorepo root
npm install

# Generate and apply migrations
npm run db:generate
npm run db:migrate

# (Optional) Add sample data
npm run db:seed
```

**4. Verify Setup**

```bash
# Open Drizzle Studio (visual database browser)
npm run db:studio

# Start server and check health endpoint
cd apps/server && npm run dev
# Visit http://localhost:3001/health
```

## Project Structure

```
apps/database/
├── src/
│   ├── schema/           # Database table definitions
│   │   ├── users.ts      # User table schema
│   │   └── index.ts      # Schema exports
│   ├── migrations/       # Auto-generated SQL migrations
│   ├── index.ts          # Database client export
│   ├── migrate.ts        # Migration runner
│   └── seed.ts           # Seed data script
├── scripts/
│   └── init-db.sh        # Database initialization script
├── drizzle.config.ts     # Drizzle configuration
├── env.example           # Environment variable template
└── package.json          # Dependencies and scripts
```

## Available Commands

Run from the monorepo root or from `apps/database/`:

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema changes |
| `npm run db:migrate` | Apply pending migrations to database |
| `npm run db:push` | Push schema changes directly (dev only) |
| `npm run db:studio` | Open Drizzle Studio (visual database browser) |
| `npm run db:seed` | Populate database with sample data |

## Basic Usage

### Importing the Database

```typescript
import { db, users, type User, type NewUser } from 'database';
import { eq } from 'drizzle-orm';
```

### Common Operations

```typescript
// Select all users
const allUsers = await db.select().from(users);

// Find user by email
const user = await db.select()
  .from(users)
  .where(eq(users.email, 'user@example.com'))
  .limit(1);

// Create user
const newUser = await db.insert(users).values({
  email: 'user@example.com',
  username: 'username',
  password: hashedPassword,
  firstName: 'John',
  lastName: 'Doe',
}).returning();

// Update user
await db.update(users)
  .set({ firstName: 'Jane' })
  .where(eq(users.id, 1));

// Delete user
await db.delete(users)
  .where(eq(users.id, 1));
```

## Adding New Tables

1. Create schema file in `src/schema/` (e.g., `posts.ts`)
2. Define table structure using Drizzle ORM syntax
3. Export from `src/schema/index.ts`
4. Generate migration: `npm run db:generate`
5. Apply migration: `npm run db:migrate`

## Production Deployment

### Environment Configuration

Update your production environment variables:

```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

### Recommended Providers

- **Heroku Postgres** - Easy setup, free tier available
- **AWS RDS** - Scalable, enterprise-grade
- **Supabase** - PostgreSQL with built-in features
- **Railway** - Simple deployment
- **Neon** - Serverless PostgreSQL

### Deployment Steps

1. Set `DATABASE_URL` in your production environment
2. Run migrations: `npm run db:migrate`
3. Ensure SSL is enabled in connection string

## Troubleshooting

### Can't connect to PostgreSQL

```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@15

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

### Database already exists

```bash
# Drop and recreate (WARNING: deletes all data!)
psql postgres -c "DROP DATABASE myapp_dev;"
psql postgres -c "CREATE DATABASE myapp_dev;"
```

### Migration issues

```bash
# Reset migrations (development only)
rm -rf src/migrations/*
npm run db:generate
npm run db:migrate
```

## Next Steps

- See [database-setup.md](./database-setup.md) for detailed installation instructions
- See [database-usage.md](./database-usage.md) for comprehensive code examples
- Visit [Drizzle ORM Documentation](https://orm.drizzle.team/) for advanced features

