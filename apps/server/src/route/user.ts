import { User } from '@application/shared';
import { Request, Response, Router } from 'express';

const userRouter = Router();

userRouter.get('/api/users', (req: Request, res: Response) => {
  const users: User[] = [
    {
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date(),
    },
    {
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date(),
    },
  ];

  res.json(users);
});

export { userRouter };

