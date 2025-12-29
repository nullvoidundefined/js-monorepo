# Database Setup Guide

This guide will help you set up PostgreSQL locally for development.

## Step 1: Install PostgreSQL

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

## Step 2: Create Database

```bash
# Access PostgreSQL CLI
psql postgres

# Create database
CREATE DATABASE myapp_dev;

# (Optional) Create test database
CREATE DATABASE myapp_test;

# Exit
\q
```

### If you need to create a user:
```sql
CREATE USER myappuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE myapp_dev TO myappuser;
```

## Step 3: Configure Environment

```bash
# From the database directory
cd apps/database

# Create .env file from example
cp env.example .env

# Edit .env with your credentials if different
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/myapp_dev
```

## Step 4: Install Dependencies

From the root of the monorepo:
```bash
npm install
```

## Step 5: Generate and Run Migrations

```bash
# From apps/database directory
cd apps/database

# Generate initial migration
npm run db:generate

# Run migrations
npm run db:migrate
```

## Step 6: (Optional) Seed Database

```bash
npm run db:seed
```

## Step 7: Verify Connection

You can use Drizzle Studio to visually inspect your database:
```bash
npm run db:studio
```

This will open a web interface at `https://local.drizzle.studio`

## Troubleshooting

### Connection refused
- Make sure PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check if the port 5432 is in use: `lsof -i :5432`

### Authentication failed
- Update your `.env` file with correct credentials
- Reset PostgreSQL password if needed

### Database does not exist
- Run `psql postgres` and execute `CREATE DATABASE myapp_dev;`

## Common Commands

```bash
# Check PostgreSQL status (macOS)
brew services list

# Check PostgreSQL status (Linux)
sudo systemctl status postgresql

# Access database
psql -d myapp_dev

# List all databases
psql -l

# Stop PostgreSQL (macOS)
brew services stop postgresql@15

# Restart PostgreSQL (macOS)
brew services restart postgresql@15
```

## Production Checklist

When deploying to production:

- [ ] Update `DATABASE_URL` with production credentials
- [ ] Enable SSL: Add `?sslmode=require` to connection string
- [ ] Use environment variables (never commit credentials)
- [ ] Set up connection pooling if needed
- [ ] Run migrations: `npm run db:migrate`
- [ ] Consider using managed PostgreSQL (AWS RDS, Heroku Postgres, Supabase, etc.)
- [ ] Set up database backups
- [ ] Configure appropriate user permissions


