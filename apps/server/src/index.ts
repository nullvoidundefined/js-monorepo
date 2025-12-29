// Load environment variables before any other imports
// eslint-disable-next-line import/order, import/newline-after-import
import * as dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import { checkDatabaseConnection } from 'database';
import express, { json, Request, Response } from 'express';
import session from 'express-session';

import { authRouter, passport } from './route/authentication';
import { userRouter } from './route/user';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

app.use(json());

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello World from Server!' });
});

app.get('/health', async (_req: Request, res: Response) => {
  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use(authRouter);
app.use(userRouter);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

export { app };
