import { pgTable, serial, varchar, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: text('password'), // Made nullable for OAuth users
  googleId: varchar('google_id', { length: 255 }).unique(), // Google OAuth ID
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  photo: text('photo'), // Profile photo URL
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Export type for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

