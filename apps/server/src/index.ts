import express, { Request, Response } from 'express';

import { User } from '@application/shared';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello World from Server!' });
});

app.get('/api/users', (req: Request, res: Response) => {
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

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export { app };

