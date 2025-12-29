# Database Usage Examples

This guide shows how to use the database in your server application.

## Importing the Database Client

```typescript
import { db, users, type User, type NewUser } from 'database';
```

## Basic CRUD Operations

### Create (Insert)

```typescript
import { db, users } from 'database';
import bcrypt from 'bcrypt';

// Insert a single user
const hashedPassword = await bcrypt.hash('password123', 10);

const newUser = await db.insert(users).values({
  email: 'user@example.com',
  username: 'johndoe',
  password: hashedPassword,
  firstName: 'John',
  lastName: 'Doe',
}).returning();

console.log('Created user:', newUser[0]);

// Insert multiple users
const newUsers = await db.insert(users).values([
  { email: 'user1@example.com', username: 'user1', password: hashedPassword },
  { email: 'user2@example.com', username: 'user2', password: hashedPassword },
]).returning();
```

### Read (Select)

```typescript
import { db, users } from 'database';
import { eq, like, and, or } from 'drizzle-orm';

// Get all users
const allUsers = await db.select().from(users);

// Get user by ID
const user = await db.select()
  .from(users)
  .where(eq(users.id, 1));

// Get user by email
const userByEmail = await db.select()
  .from(users)
  .where(eq(users.email, 'user@example.com'));

// Get first matching user
const firstUser = await db.select()
  .from(users)
  .where(eq(users.email, 'user@example.com'))
  .limit(1);

// Search users
const searchResults = await db.select()
  .from(users)
  .where(like(users.username, '%john%'));

// Complex queries
const activeJohns = await db.select()
  .from(users)
  .where(
    and(
      eq(users.isActive, true),
      like(users.firstName, '%John%')
    )
  );

// Select specific fields
const userEmails = await db.select({
  id: users.id,
  email: users.email,
}).from(users);
```

### Update

```typescript
import { db, users } from 'database';
import { eq } from 'drizzle-orm';

// Update user
const updated = await db.update(users)
  .set({
    firstName: 'Jane',
    updatedAt: new Date(),
  })
  .where(eq(users.id, 1))
  .returning();

// Update multiple fields
await db.update(users)
  .set({
    isActive: false,
    updatedAt: new Date(),
  })
  .where(eq(users.email, 'user@example.com'));
```

### Delete

```typescript
import { db, users } from 'database';
import { eq, lt } from 'drizzle-orm';

// Delete user
await db.delete(users)
  .where(eq(users.id, 1));

// Delete inactive users
await db.delete(users)
  .where(eq(users.isActive, false));

// Delete old users (example)
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

await db.delete(users)
  .where(lt(users.createdAt, oneYearAgo));
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

    // Check if user already exists
    const existingUser = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
    }).returning();

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = newUser[0];

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

    // Find user
    const result = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result[0];

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Verify password
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

    const result = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      createdAt: users.createdAt,
    }).from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});
```

### List Users with Pagination

```typescript
router.get('/api/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const userList = await db.select({
      id: users.id,
      email: users.email,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
    }).from(users)
      .limit(limit)
      .offset(offset);

    res.json({
      users: userList,
      page,
      limit,
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
```

## Transactions

```typescript
import { db, users } from 'database';

// Execute multiple operations in a transaction
await db.transaction(async (tx) => {
  // Create user
  const newUser = await tx.insert(users).values({
    email: 'user@example.com',
    username: 'username',
    password: 'hashed_password',
  }).returning();

  // Update another table (example)
  // await tx.insert(userProfiles).values({
  //   userId: newUser[0].id,
  //   bio: 'New user',
  // });

  // If any operation fails, entire transaction is rolled back
});
```

## Raw SQL Queries

For complex queries not easily expressed with the query builder:

```typescript
import { sql } from 'drizzle-orm';

// Execute raw SQL
const result = await db.execute(sql`
  SELECT * FROM users 
  WHERE created_at > NOW() - INTERVAL '7 days'
`);

// With parameters (prevents SQL injection)
const email = 'user@example.com';
const user = await db.execute(sql`
  SELECT * FROM users WHERE email = ${email}
`);
```

## Type Safety

```typescript
import { type User, type NewUser } from 'database';

// User type (for select queries)
const user: User = {
  id: 1,
  email: 'user@example.com',
  username: 'username',
  password: 'hashed_password',
  firstName: 'John',
  lastName: 'Doe',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// NewUser type (for insert queries - id is auto-generated)
const newUser: NewUser = {
  email: 'user@example.com',
  username: 'username',
  password: 'hashed_password',
  firstName: 'John',
  lastName: 'Doe',
};
```

## Best Practices

1. **Always hash passwords** before storing
2. **Never return passwords** in API responses
3. **Use transactions** for related operations
4. **Validate input** before database operations
5. **Use TypeScript types** for type safety
6. **Handle errors** appropriately
7. **Use parameterized queries** to prevent SQL injection
8. **Create indexes** for frequently queried fields
9. **Use connection pooling** (already configured)
10. **Close connections** on application shutdown

## Error Handling

```typescript
import { db, users } from 'database';
import { eq } from 'drizzle-orm';

try {
  const user = await db.select()
    .from(users)
    .where(eq(users.id, 1));
} catch (error) {
  if (error.code === '23505') {
    // Unique constraint violation
    console.error('User already exists');
  } else if (error.code === '23503') {
    // Foreign key constraint violation
    console.error('Referenced record does not exist');
  } else {
    console.error('Database error:', error);
  }
}
```

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle ORM Query Examples](https://orm.drizzle.team/docs/select)


