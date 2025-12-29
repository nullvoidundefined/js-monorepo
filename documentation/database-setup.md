# Database Setup Guide

Detailed instructions for setting up PostgreSQL locally for development.

## Table of Contents

1. [Install PostgreSQL](#install-postgresql)
2. [Create Database](#create-database)
3. [Configure Environment](#configure-environment)
4. [Schema Management](#schema-management)
5. [Migrations](#migrations)

## Install PostgreSQL

### macOS

```bash
# Install using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
pg_isready
```

### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
sudo systemctl status postgresql
```

### Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer
3. Follow the installation wizard
4. Remember the password you set for the `postgres` user
5. Verify installation by opening Command Prompt:
   ```cmd
   psql --version
   ```

## Create Database

### Option 1: Automated Setup (Recommended)

```bash
cd apps/database
chmod +x scripts/init-db.sh
./scripts/init-db.sh
```

This script will:
- Create the `myapp_dev` database
- Copy `env.example` to `.env`
- Set up the environment configuration

### Option 2: Manual Setup

**Step 1: Access PostgreSQL**

```bash
# Default user is 'postgres'
psql postgres
```

**Step 2: Create Database**

```sql
-- Create development database
CREATE DATABASE myapp_dev;

-- (Optional) Create test database
CREATE DATABASE myapp_test;

-- Verify databases were created
\l

-- Exit psql
\q
```

**Step 3: (Optional) Create Custom User**

```sql
-- Connect to postgres
psql postgres

-- Create user
CREATE USER myappuser WITH PASSWORD 'yourpassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE myapp_dev TO myappuser;

-- Exit
\q
```

## Configure Environment

### Step 1: Create Environment File

```bash
cd apps/database
cp env.example .env
```

### Step 2: Update Database URL

Edit the `.env` file with your database credentials:

**Default Configuration:**
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev
```

**Custom User Configuration:**
```bash
DATABASE_URL=postgresql://myappuser:yourpassword@localhost:5432/myapp_dev
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?[options]
```

### Step 3: Verify Connection

```bash
# From apps/database directory
npm install

# Test connection by opening Drizzle Studio
npm run db:studio
```

## Schema Management

### Understanding the Schema

Schema files are located in `apps/database/src/schema/`.

**Current Schema: `users.ts`**

```typescript
import { pgTable, serial, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  googleId: varchar('google_id', { length: 255 }).unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  photo: text('photo'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

### Creating New Tables

**Example: Creating a Posts Table**

**1. Create `src/schema/posts.ts`:**

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

**2. Export from `src/schema/index.ts`:**

```typescript
export * from './users';
export * from './posts';
```

**3. Generate migration:**

```bash
npm run db:generate
```

**4. Review and apply migration:**

```bash
# Review the generated SQL in src/migrations/
npm run db:migrate
```

### Available Column Types

```typescript
import {
  serial,        // Auto-incrementing integer
  integer,       // Integer
  varchar,       // Variable-length string (requires length)
  text,          // Unlimited text
  boolean,       // True/false
  timestamp,     // Date and time
  numeric,       // Decimal numbers
  json,          // JSON data
  uuid,          // UUID
} from 'drizzle-orm/pg-core';
```

### Common Constraints

```typescript
// Primary key
id: serial('id').primaryKey()

// Not null
email: varchar('email', { length: 255 }).notNull()

// Unique
email: varchar('email', { length: 255 }).unique()

// Default value
isActive: boolean('is_active').default(true)

// Foreign key
authorId: integer('author_id').references(() => users.id)
```

## Migrations

### Migration Workflow

1. **Modify Schema** - Edit files in `src/schema/`
2. **Generate Migration** - Run `npm run db:generate`
3. **Review SQL** - Check generated files in `src/migrations/`
4. **Apply Migration** - Run `npm run db:migrate`

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

### Example: Adding a Column

**1. Edit schema:**

```typescript
// src/schema/users.ts
export const users = pgTable('users', {
  // ... existing fields
  phoneNumber: varchar('phone_number', { length: 20 }), // NEW FIELD
});
```

**2. Generate migration:**

```bash
npm run db:generate
# Drizzle will prompt for a migration name
```

**3. Review generated SQL:**

```sql
-- Example: src/migrations/0002_add_phone_number.sql
ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);
```

**4. Apply migration:**

```bash
npm run db:migrate
```

### Migration Best Practices

✅ **Do:**
- Review generated SQL before applying
- Test migrations on development database first
- Keep migrations in version control
- Use descriptive migration names
- Backup data before running migrations

❌ **Don't:**
- Edit applied migration files
- Use `db:push` in production
- Skip migrations
- Delete migration history

## Troubleshooting

### PostgreSQL Not Running

```bash
# Check status (macOS)
brew services list | grep postgresql

# Check status (Linux)
sudo systemctl status postgresql

# Start service (macOS)
brew services start postgresql@15

# Start service (Linux)
sudo systemctl start postgresql
```

### Connection Refused

```bash
# Check if PostgreSQL is listening
lsof -i :5432

# Or use pg_isready
pg_isready -h localhost -p 5432
```

### Permission Denied

```bash
# Grant permissions to your user
psql postgres
GRANT ALL PRIVILEGES ON DATABASE myapp_dev TO yourusername;
\q
```

### Database Already Exists

```bash
# Drop and recreate (WARNING: Deletes all data)
psql postgres -c "DROP DATABASE myapp_dev;"
psql postgres -c "CREATE DATABASE myapp_dev;"
```

### Reset Migrations

```bash
# WARNING: Development only!
# This will delete migration history
rm -rf src/migrations/*
npm run db:generate
npm run db:migrate
```

## Production Checklist

When deploying to production:

- [ ] Update `DATABASE_URL` with production credentials
- [ ] Enable SSL in connection string: `?sslmode=require`
- [ ] Use environment variables (never commit credentials)
- [ ] Set up connection pooling if needed
- [ ] Run migrations: `npm run db:migrate`
- [ ] Consider using managed PostgreSQL (AWS RDS, Supabase, etc.)
- [ ] Set up automated database backups
- [ ] Configure appropriate user permissions
- [ ] Monitor database performance and logs

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [database-overview.md](./database-overview.md) - Quick start guide
- [database-usage.md](./database-usage.md) - Code examples

