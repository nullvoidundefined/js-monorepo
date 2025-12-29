# Complete Database Guide

This comprehensive guide covers everything you need to know about the database setup in this monorepo.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Schema Management](#schema-management)
5. [Migrations](#migrations)
6. [Usage in Server](#usage-in-server)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Overview

### Technology Stack

- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Migration Tool**: Drizzle Kit
- **Language**: TypeScript

### Why This Stack?

- **PostgreSQL**: Industry-standard, reliable, feature-rich relational database
- **Drizzle ORM**: Lightweight, type-safe, SQL-like syntax, no code generation required
- **TypeScript**: Full type safety from database to API

### Project Structure

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
├── package.json          # Dependencies and scripts
└── README.md             # Documentation
```

## Quick Start

### 1. Prerequisites

Install PostgreSQL:

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/

### 2. Create Database

```bash
psql postgres -c "CREATE DATABASE myapp_dev;"
```

### 3. Configure Environment

```bash
cd apps/database
cp env.example .env
# Edit .env if your PostgreSQL credentials are different
```

### 4. Install & Migrate

```bash
# From monorepo root
npm install

# Generate migrations
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Add sample data
npm run db:seed
```

### 5. Verify

```bash
npm run db:studio
```

Open the URL shown to browse your database visually.

## Detailed Setup

### Local Development Setup

#### Step 1: PostgreSQL Installation & Configuration

**Verify Installation:**
```bash
psql --version
```

**Check Service Status:**
```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Check if listening on port 5432
pg_isready -p 5432
```

#### Step 2: Database Creation

**Interactive Method:**
```bash
# Connect to PostgreSQL
psql postgres

# Inside psql:
CREATE DATABASE myapp_dev;
CREATE DATABASE myapp_test;  -- Optional for testing

# Verify
\l

# Exit
\q
```

**Script Method:**
```bash
cd apps/database
chmod +x scripts/init-db.sh
./scripts/init-db.sh
```

#### Step 3: Environment Configuration

**Default Configuration (.env):**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev
```

**Custom User Configuration:**
```bash
# If you created a specific user:
DATABASE_URL=postgresql://myappuser:mypassword@localhost:5432/myapp_dev
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

#### Step 4: Install Dependencies

```bash
# From monorepo root
npm install

# This installs:
# - drizzle-orm: ORM library
# - drizzle-kit: Migration and schema management
# - pg: PostgreSQL client
# - All dev dependencies
```

## Schema Management

### Defining Tables

Create new schema files in `src/schema/`:

**Example: `src/schema/posts.ts`**
```typescript
import { pgTable, serial, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { users } from './users';

export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content'),
  authorId: integer('author_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

**Export in `src/schema/index.ts`:**
```typescript
export * from './users';
export * from './posts';
```

### Column Types

```typescript
import {
  serial,        // Auto-incrementing integer
  integer,       // Integer
  varchar,       // Variable-length string
  text,          // Unlimited text
  boolean,       // True/false
  timestamp,     // Date and time
  numeric,       // Decimal numbers
  json,          // JSON data
  uuid,          // UUID
} from 'drizzle-orm/pg-core';
```

### Constraints

```typescript
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  age: integer('age').default(0),
  isActive: boolean('is_active').default(true).notNull(),
});
```

### Relationships

```typescript
// One-to-Many: User has many posts
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  authorId: integer('author_id').references(() => users.id),
  // ...
});
```

## Migrations

### Workflow

1. **Modify Schema** → Edit files in `src/schema/`
2. **Generate Migration** → `npm run db:generate`
3. **Review SQL** → Check `src/migrations/`
4. **Apply Migration** → `npm run db:migrate`

### Commands

```bash
# Generate migration from schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema directly (dev only, skips migrations)
npm run db:push

# Open database GUI
npm run db:studio
```

### Example Workflow

**Add a new field:**

1. Edit schema:
```typescript
// src/schema/users.ts
export const users = pgTable('users', {
  // ... existing fields
  phoneNumber: varchar('phone_number', { length: 20 }), // NEW
});
```

2. Generate migration:
```bash
npm run db:generate
# Creates: src/migrations/0001_add_phone_number.sql
```

3. Review generated SQL:
```sql
-- src/migrations/0001_add_phone_number.sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
```

4. Apply migration:
```bash
npm run db:migrate
```

### Migration Best Practices

- ✅ Always review generated SQL before applying
- ✅ Test migrations on development database first
- ✅ Keep migrations in version control
- ✅ Never edit applied migration files
- ✅ Use transactions for complex migrations
- ❌ Don't use `db:push` in production
- ❌ Don't skip migrations

## Usage in Server

### Importing

```typescript
import { db, users, type User, type NewUser } from 'database';
```

### Basic Queries

See [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) for comprehensive examples.

**Quick Reference:**

```typescript
// Select all
const allUsers = await db.select().from(users);

// Select with condition
const user = await db.select()
  .from(users)
  .where(eq(users.id, 1));

// Insert
const newUser = await db.insert(users)
  .values({ email: 'user@example.com', ... })
  .returning();

// Update
await db.update(users)
  .set({ firstName: 'Jane' })
  .where(eq(users.id, 1));

// Delete
await db.delete(users)
  .where(eq(users.id, 1));
```

## Production Deployment

### Environment Configuration

**Development:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev
```

**Production:**
```bash
DATABASE_URL=postgresql://user:password@prod-host.region.provider.com:5432/dbname?sslmode=require
```

### Migration Strategy

1. **Before Deployment:**
   - Test all migrations on staging
   - Backup production database
   - Plan for rollback if needed

2. **During Deployment:**
   ```bash
   # Run migrations as part of deployment
   npm run db:migrate
   ```

3. **After Deployment:**
   - Verify database schema
   - Check application health
   - Monitor for errors

### Managed Database Services

**Recommended Providers:**

- **Heroku Postgres**: Easy setup, free tier available
- **AWS RDS**: Scalable, enterprise-grade
- **Supabase**: PostgreSQL with built-in features
- **Railway**: Simple deployment
- **Neon**: Serverless PostgreSQL

**Example Connection Strings:**

```bash
# Heroku
DATABASE_URL=postgres://user:pass@ec2-xxx.compute-1.amazonaws.com:5432/dbname

# Supabase
DATABASE_URL=postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres

# AWS RDS
DATABASE_URL=postgresql://admin:pass@mydb.xxx.us-east-1.rds.amazonaws.com:5432/myapp
```

### Security Checklist

- [ ] Use environment variables for credentials
- [ ] Enable SSL connections (`?sslmode=require`)
- [ ] Use strong passwords
- [ ] Limit database user permissions
- [ ] Enable connection pooling
- [ ] Set up database backups
- [ ] Monitor database access logs
- [ ] Keep PostgreSQL updated

## Troubleshooting

### Common Issues

**1. Can't connect to PostgreSQL**

```bash
# Check if running
pg_isready

# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql     # Linux

# Check logs
tail -f /usr/local/var/log/postgres.log  # macOS
sudo journalctl -u postgresql            # Linux
```

**2. Database already exists**

```bash
# Drop and recreate (WARNING: deletes all data)
psql postgres -c "DROP DATABASE myapp_dev;"
psql postgres -c "CREATE DATABASE myapp_dev;"
```

**3. Permission denied**

```bash
# Grant permissions
psql postgres
GRANT ALL PRIVILEGES ON DATABASE myapp_dev TO myuser;
\q
```

**4. Migration fails**

```bash
# Check migration files
ls -la src/migrations/

# Try rolling back
# (Drizzle doesn't have built-in rollback, you may need to manually revert)

# Reset migrations (DANGER: development only)
rm -rf src/migrations/*
npm run db:generate
npm run db:migrate
```

**5. Type errors with Drizzle**

```bash
# Rebuild database package
cd apps/database
npm run build

# Reinstall from root
cd ../..
npm install
```

**6. Connection pool exhausted**

Check your connection limits and ensure you're closing connections properly:

```typescript
import { closeDatabaseConnection } from 'database';

// On application shutdown
process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});
```

### Debug Mode

Enable verbose logging:

```typescript
// In drizzle.config.ts
export default {
  // ...
  verbose: true,
  strict: true,
};
```

### Getting Help

1. Check documentation in this folder
2. Review [Drizzle ORM Docs](https://orm.drizzle.team/)
3. Check PostgreSQL logs
4. Search GitHub issues
5. Ask on Discord/Stack Overflow

## Additional Resources

- [README.md](./README.md) - Overview and commands
- [QUICKSTART.md](./QUICKSTART.md) - Fast setup guide
- [SETUP.md](./SETUP.md) - Detailed installation
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Code examples
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)


