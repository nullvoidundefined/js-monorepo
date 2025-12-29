import { User } from '@application/shared';
import { db, users } from 'database';
import { Request, Response, Router } from 'express';

const userRouter = Router();

userRouter.get('/api/users', async (req: Request, res: Response) => {
  try {
    // Get sorting parameters from query
    const sortBy = (req.query.sortBy as string) || 'name';
    const order = (req.query.order as string) || 'asc';

    // Fetch users from database
    const dbUsers = await db.select().from(users);

    // Transform database users to match the User type
    const transformedUsers: User[] = dbUsers.map(dbUser => ({
      id: dbUser.id.toString(),
      email: dbUser.email,
      name: [dbUser.firstName, dbUser.lastName].filter(Boolean).join(' ') || dbUser.username,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    }));

    // Sort users based on parameters
    const sortedUsers = [...transformedUsers].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'email') {
        comparison = a.email.localeCompare(b.email);
      } else if (sortBy === 'id') {
        comparison = a.id.localeCompare(b.id);
      }

      return order === 'desc' ? -comparison : comparison;
    });

    res.json(sortedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export { userRouter };
