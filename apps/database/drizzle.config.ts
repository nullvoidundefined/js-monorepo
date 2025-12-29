import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

dotenv.config();

export default {
  driver: 'pg',
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/myapp_dev',
  },
  out: './src/migrations',
  schema: './src/schema/*.ts',
  strict: true,
  verbose: true,
} satisfies Config;
