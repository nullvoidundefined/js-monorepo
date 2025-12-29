# Database Usage Guide

Practical examples for using the database in your server application.

## Table of Contents

1. [Importing the Database](#importing-the-database)
2. [Basic CRUD Operations](#basic-crud-operations)
3. [Express Route Examples](#express-route-examples)
4. [Transactions](#transactions)
5. [Raw SQL Queries](#raw-sql-queries)
6. [Best Practices](#best-practices)

## Importing the Database

```typescript
import { db, users, type User, type NewUser } from 'database';
import { eq, like, and, or, gt, lt } from 'drizzle-orm';
```

## Basic CRUD Operations

### Create (Insert)

```typescript
import { db, users } from 'database';
import bcrypt from 'bcrypt';

// Insert a single user
const hashedPassword = await bcrypt.hash('password123', 10);

const [newUser] = await db
  .insert(users)
  .values({
    email: 'user@example.com',
    username: 'johndoe',
    password: hashedPassword,
    firstName: 'John',
    lastName: 'Doe',
  })
  .returning();

console.log('Created user:', newUser);

// Insert multiple users
const newUsers = await db
  .insert(users)
  .values([
    { email: 'user1@example.com', username: 'user1', password: hashedPassword },
    { email: 'user2@example.com', username: 'user2', password: hashedPassword },
  ])
  .returning();
```

### Read (Select)

```typescript
import { db, users } from 'database';
import { eq, like, and, or } from 'drizzle-orm';

// Get all users
const allUsers = await db.select().from(users);

// Get user by ID
const [user] = await db.select().from(users).where(eq(users.id, 1)).limit(1);

// Get user by email
const [userByEmail] = await db
  .select()
  .from(users)
  .where(eq(users.email, 'user@example.com'))
  .limit(1);

// Search users by username
const searchResults = await db.select().from(users).where(like(users.username, '%john%'));

// Complex queries with multiple conditions
const activeUsers = await db
  .select()
  .from(users)
  .where(and(eq(users.isActive, true), like(users.firstName, '%John%')));

// Select specific fields only
const userEmails = await db
  .select({
    id: users.id,
    email: users.email,
    name: users.firstName,
  })
  .from(users);

// Pagination
const page = 1;
const limit = 10;
const offset = (page - 1) * limit;

const paginatedUsers = await db.select().from(users).limit(limit).offset(offset);
```

### Update

```typescript
import { db, users } from 'database';
import { eq } from 'drizzle-orm';

// Update single user
const [updated] = await db
  .update(users)
  .set({
    firstName: 'Jane',
    updatedAt: new Date(),
  })
  .where(eq(users.id, 1))
  .returning();

// Update multiple fields
await db
  .update(users)
  .set({
    isActive: false,
    updatedAt: new Date(),
  })
  .where(eq(users.email, 'user@example.com'));

// Conditional update
await db
  .update(users)
  .set({ isActive: true })
  .where(and(eq(users.isActive, false), like(users.email, '%@example.com')));
```

### Delete

```typescript
import { db, users } from 'database';
import { eq, lt } from 'drizzle-orm';

// Delete single user
await db.delete(users).where(eq(users.id, 1));

// Delete inactive users
await db.delete(users).where(eq(users.isActive, false));

// Delete old users (created more than a year ago)
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

await db.delete(users).where(lt(users.createdAt, oneYearAgo));
```

## Express Route Examples

### User Registration

```typescript
import { Router } from 'express';
import { db, users } from 'database';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/api/register', async (req, res) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
      })
      .returning();

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

export default router;
```

### User Login

```typescript
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Verify password
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set session
    req.session.userId = user.id;

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
```

### Get User Profile

```typescript
router.get('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        photo: users.photo,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});
```

### List Users with Pagination and Sorting

```typescript
router.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const userList = await db
      .select({
        id: users.id,
        email: users.email,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.isActive, true))
      .limit(limit)
      .offset(offset);

    res.json({
      users: userList,
      page,
      limit,
      total: userList.length,
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
```

### Update User Profile

```typescript
router.patch('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { firstName, lastName } = req.body;

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        firstName,
        lastName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});
```

## Transactions

Use transactions to ensure multiple operations succeed or fail together:

```typescript
import { db, users } from 'database';

// Execute multiple operations in a transaction
await db.transaction(async tx => {
  // Create user
  const [newUser] = await tx
    .insert(users)
    .values({
      email: 'user@example.com',
      username: 'username',
      password: 'hashed_password',
    })
    .returning();

  // Create related record (example)
  // await tx.insert(userProfiles).values({
  //   userId: newUser.id,
  //   bio: 'New user bio',
  // });

  // If any operation fails, entire transaction is rolled back
});
```

## Raw SQL Queries

For complex queries not easily expressed with the query builder:

```typescript
import { sql } from 'drizzle-orm';

// Execute raw SQL
const recentUsers = await db.execute(sql`
  SELECT * FROM users 
  WHERE created_at > NOW() - INTERVAL '7 days'
  ORDER BY created_at DESC
`);

// With parameters (prevents SQL injection)
const email = 'user@example.com';
const result = await db.execute(sql`
  SELECT * FROM users 
  WHERE email = ${email}
`);

// Count query
const [{ count }] = await db.execute(sql`
  SELECT COUNT(*) as count FROM users 
  WHERE is_active = true
`);
```

## Best Practices

### 1. Always Hash Passwords

```typescript
import bcrypt from 'bcrypt';

// Hash before storing
const hashedPassword = await bcrypt.hash(password, 10);

// Verify on login
const isValid = await bcrypt.compare(password, user.password);
```

### 2. Never Return Passwords

```typescript
// Bad
res.json(user);

// Good
const { password, ...userWithoutPassword } = user;
res.json(userWithoutPassword);
```

### 3. Use Type Safety

```typescript
import { type User, type NewUser } from 'database';

// For select queries
const user: User = await db.select()...;

// For insert queries
const newUser: NewUser = {
  email: 'user@example.com',
  username: 'username',
  // TypeScript ensures all required fields are present
};
```

### 4. Validate Input

```typescript
// Validate before database operations
if (!email || !username) {
  return res.status(400).json({ error: 'Missing required fields' });
}

// Use a validation library like Zod
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(8),
});

const validated = userSchema.parse(req.body);
```

### 5. Handle Errors Gracefully

```typescript
try {
  // Database operations
} catch (error) {
  // Check for specific error codes
  if (error.code === '23505') {
    // Unique constraint violation
    return res.status(400).json({ error: 'User already exists' });
  }

  if (error.code === '23503') {
    // Foreign key constraint violation
    return res.status(400).json({ error: 'Referenced record does not exist' });
  }

  // Generic error
  console.error('Database error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

### 6. Use Transactions for Related Operations

```typescript
// Good: Use transaction for related operations
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({...}).returning();
  await tx.insert(userProfiles).values({ userId: user.id, ... });
});
```

### 7. Implement Pagination

```typescript
// Always limit results for large datasets
const users = await db.select().from(users).limit(10).offset(0);
```

### 8. Use Indexes for Performance

```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
```

### 9. Close Connections on Shutdown

```typescript
// In your server shutdown handler
process.on('SIGINT', async () => {
  // Close database connections
  await db.$client.end();
  process.exit(0);
});
```

### 10. Use Environment Variables

```typescript
// Never hardcode credentials
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}
```

## Error Codes Reference

| Code    | Description                      | Handling                  |
| ------- | -------------------------------- | ------------------------- |
| `23505` | Unique constraint violation      | User already exists       |
| `23503` | Foreign key constraint violation | Referenced record missing |
| `23502` | Not null constraint violation    | Required field missing    |
| `42P01` | Undefined table                  | Run migrations            |
| `42703` | Undefined column                 | Schema mismatch           |

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Drizzle Query Examples](https://orm.drizzle.team/docs/select)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [database-overview.md](./database-overview.md) - Quick start guide
- [database-setup.md](./database-setup.md) - Installation instructions
