import { db, users } from './index';
import * as dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Insert sample users
    const sampleUsers = await db.insert(users).values([
      {
        email: 'admin@example.com',
        username: 'admin',
        password: '$2b$10$YourHashedPasswordHere', // Replace with actual hashed password
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      },
      {
        email: 'user@example.com',
        username: 'testuser',
        password: '$2b$10$YourHashedPasswordHere', // Replace with actual hashed password
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
      },
    ]).returning();

    console.log('✅ Seed data inserted successfully!');
    console.log(`Created ${sampleUsers.length} users`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

seed();



