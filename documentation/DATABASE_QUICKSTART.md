# Quick Start Guide

Get your local PostgreSQL database up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed (see [SETUP.md](./SETUP.md) for installation instructions)

## Quick Setup (3 Steps)

### 1. Initialize Database

Run the initialization script:

```bash
cd apps/database
chmod +x scripts/init-db.sh
./scripts/init-db.sh
```

Or manually:

```bash
# Create database
psql postgres -c "CREATE DATABASE myapp_dev;"

# Create .env file
cp env.example .env
```

### 2. Install Dependencies

From the monorepo root:

```bash
npm install
```

### 3. Run Migrations

```bash
cd apps/database

# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

## Verify Installation

```bash
# Open Drizzle Studio
npm run db:studio
```

Visit the URL shown in the terminal to browse your database visually.

## Optional: Add Sample Data

```bash
npm run db:seed
```

## Using in Your Server

The server is already configured to use the database. Start your server:

```bash
cd apps/server
npm run dev
```

Check the health endpoint: http://localhost:3001/health

You should see:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed configuration
- Read [README.md](./README.md) for usage examples
- Add more tables in `src/schema/`
- Customize seed data in `src/seed.ts`

## Troubleshooting

**Can't connect to PostgreSQL?**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL (macOS)
brew services start postgresql@15

# Start PostgreSQL (Linux)
sudo systemctl start postgresql
```

**Database already exists?**
```bash
# Drop and recreate (WARNING: deletes all data!)
psql postgres -c "DROP DATABASE myapp_dev;"
psql postgres -c "CREATE DATABASE myapp_dev;"
```

**Need to reset migrations?**
```bash
# Delete migration files
rm -rf src/migrations/*

# Regenerate
npm run db:generate
npm run db:migrate
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate migration files from schema |
| `npm run db:migrate` | Run pending migrations |
| `npm run db:push` | Push schema changes (dev only) |
| `npm run db:studio` | Open database GUI |
| `npm run db:seed` | Populate with sample data |

## From Monorepo Root

You can also run database commands from the root:

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
npm run db:seed
```


