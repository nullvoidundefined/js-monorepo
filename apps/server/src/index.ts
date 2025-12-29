// Load environment variables before any other imports
// eslint-disable-next-line import/order, import/newline-after-import
import * as dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import { checkDatabaseConnection } from 'database';
import express, { json, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import session from 'express-session';
import helmet from 'helmet';

import { ApiRoute } from '@packages/constant';

import { errorHandler } from './middleware/errorHandler';
import { authRouter, passport } from './route/authentication';
import { userRouter } from './route/user';

// Validate required environment variables
if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per windowMs
  message: 'Too many authentication attempts, please try again later',
  skipSuccessfulRequests: true,
});

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Request body size limits
app.use(json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // CSRF protection
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Hello World from Server!' });
});

app.get(ApiRoute.Health, async (_req: Request, res: Response) => {
  const dbConnected = await checkDatabaseConnection();
  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

// Apply auth rate limiter to authentication routes
app.use(ApiRoute.AuthGoogle, authLimiter);

app.use(authRouter);
app.use(userRouter);

// Global error handler (must be last)
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('Security features enabled: helmet, rate limiting, CSRF protection');
  });
}

export { app };
