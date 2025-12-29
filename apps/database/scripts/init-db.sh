#!/bin/bash

# Database initialization script for local development
# This script sets up a PostgreSQL database for the application

set -e

echo "🚀 Initializing PostgreSQL database..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="${DB_NAME:-myapp_dev}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Function to check if PostgreSQL is installed
check_postgres_installed() {
  if command -v psql &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL is installed"
    return 0
  else
    echo -e "${RED}✗${NC} PostgreSQL is not installed"
    return 1
  fi
}

# Function to check if PostgreSQL is running
check_postgres_running() {
  if pg_isready -h "$DB_HOST" -p "$DB_PORT" &> /dev/null; then
    echo -e "${GREEN}✓${NC} PostgreSQL is running"
    return 0
  else
    echo -e "${RED}✗${NC} PostgreSQL is not running"
    return 1
  fi
}

# Function to create database
create_database() {
  echo "📝 Creating database: $DB_NAME"
  
  # Check if database already exists
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠${NC}  Database '$DB_NAME' already exists"
  else
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "CREATE DATABASE $DB_NAME;" postgres
    echo -e "${GREEN}✓${NC} Database '$DB_NAME' created successfully"
  fi
}

# Function to create .env file
create_env_file() {
  if [ -f .env ]; then
    echo -e "${YELLOW}⚠${NC}  .env file already exists, skipping..."
  else
    echo "📝 Creating .env file..."
    cp env.example .env
    
    # Update with actual values if different from defaults
    if [ "$DB_USER" != "postgres" ] || [ "$DB_PASSWORD" != "postgres" ] || [ "$DB_NAME" != "myapp_dev" ]; then
      sed -i.bak "s|postgresql://postgres:postgres@localhost:5432/myapp_dev|postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME|" .env
      rm .env.bak
    fi
    
    echo -e "${GREEN}✓${NC} .env file created"
  fi
}

# Main execution
main() {
  echo ""
  echo "================================"
  echo "  Database Initialization"
  echo "================================"
  echo ""
  
  # Check if PostgreSQL is installed
  if ! check_postgres_installed; then
    echo ""
    echo -e "${YELLOW}Please install PostgreSQL first:${NC}"
    echo "  macOS:   brew install postgresql@15"
    echo "  Ubuntu:  sudo apt install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/"
    exit 1
  fi
  
  # Check if PostgreSQL is running
  if ! check_postgres_running; then
    echo ""
    echo -e "${YELLOW}Please start PostgreSQL first:${NC}"
    echo "  macOS:   brew services start postgresql@15"
    echo "  Ubuntu:  sudo systemctl start postgresql"
    echo "  Windows: Start via Services or pgAdmin"
    exit 1
  fi
  
  echo ""
  
  # Create database
  create_database
  
  echo ""
  
  # Create .env file
  create_env_file
  
  echo ""
  echo -e "${GREEN}✓${NC} Database initialization complete!"
  echo ""
  echo "Next steps:"
  echo "  1. Install dependencies: npm install"
  echo "  2. Generate migrations: npm run db:generate"
  echo "  3. Run migrations: npm run db:migrate"
  echo "  4. (Optional) Seed data: npm run db:seed"
  echo ""
}

# Run main function
main


