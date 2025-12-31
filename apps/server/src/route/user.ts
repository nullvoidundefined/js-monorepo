import { db, users } from 'database';
import { Request, Response, Router } from 'express';

import { ApiRoute } from '@packages/constant';
import { User } from '@packages/type';

import { requireAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { userListQuerySchema, validateQuery } from '../middleware/validation';

const userRouter = Router();

userRouter.get(
  ApiRoute.Users,
  requireAuth,
  validateQuery(userListQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    // Get validated sorting parameters from query
    const { sortBy, order } = req.query as {
      sortBy: 'name' | 'email' | 'id';
      order: 'asc' | 'desc';
    };

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
  })
);

export { userRouter };
