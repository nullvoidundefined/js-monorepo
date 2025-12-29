# Security Documentation

This document outlines the security measures implemented in the server application.

## Security Features

### 1. Authentication & Authorization

#### Session-Based Authentication
- Uses `express-session` with secure configuration
- Sessions require `SESSION_SECRET` environment variable (no insecure defaults)
- Cookie settings:
  - `httpOnly: true` - Prevents XSS attacks
  - `secure: true` (in production) - HTTPS only
  - `sameSite: 'lax'` - CSRF protection
  - `maxAge: 24 hours` - Automatic session expiration

#### Protected Routes
- `/api/users` - Requires authentication via `requireAuth` middleware
- All sensitive endpoints protected with authentication middleware

#### Session Serialization
- Only user ID stored in session (not full user object)
- Fresh user data fetched from database on each request
- Prevents stale data and reduces session storage size

### 2. Rate Limiting

#### Global Rate Limit
- 100 requests per 15 minutes per IP
- Applied to all routes

#### Authentication Rate Limit
- 5 attempts per 15 minutes per IP
- Applied to `/api/auth/google` endpoint
- Prevents brute force attacks
- Skips counting successful requests

### 3. Security Headers (Helmet)

Helmet adds the following security headers:

- **Content-Security-Policy**: Prevents XSS attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: Additional XSS protection
- **Strict-Transport-Security**: Enforces HTTPS (in production)

### 4. Input Validation

#### Zod Schema Validation
- All query parameters validated against schemas
- All request bodies validated (when applicable)
- Type-safe validation with detailed error messages
- Examples:
  - User list queries: `sortBy` and `order` parameters validated

### 5. CORS Protection

- Configured to allow only specific origins
- Credentials enabled for authenticated requests
- Origin: `process.env.CLIENT_URL` (defaults to localhost:3000)

### 6. Request Size Limits

- JSON body size limited to 10KB
- URL-encoded body size limited to 10KB
- Prevents memory exhaustion attacks

### 7. Error Handling

#### Production Error Handling
- Generic error messages to prevent information leakage
- Detailed errors only in development
- Errors logged securely without exposing sensitive data

#### Async Error Handling
- `asyncHandler` wrapper catches errors in async routes
- Prevents unhandled promise rejections
- Passes errors to global error handler

### 8. SQL Injection Protection

- Using Drizzle ORM with parameterized queries
- No raw SQL queries with user input
- Type-safe database operations

### 9. OAuth Security

- Google OAuth 2.0 implementation
- Client ID and Secret required from environment variables
- Secure callback URL configuration
- Profile validation before user creation

## Environment Variables

### Required Variables

```bash
SESSION_SECRET=<strong-random-string>
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

### Generating a Secure Session Secret

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Optional Variables

```bash
PORT=3001
NODE_ENV=development|production|test
CLIENT_URL=http://localhost:3000
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

## Security Best Practices

### For Production Deployment

1. **Environment Variables**
   - Never commit `.env` file to version control
   - Use secure secret management (AWS Secrets Manager, Azure Key Vault, etc.)
   - Rotate secrets regularly

2. **HTTPS**
   - Always use HTTPS in production
   - Set `NODE_ENV=production` to enable secure cookies
   - Consider using services like Let's Encrypt for SSL certificates

3. **Session Storage**
   - Current implementation uses in-memory sessions (not suitable for production)
   - Recommended: Use Redis or PostgreSQL for session storage
   - Example with Redis:
     ```typescript
     import RedisStore from 'connect-redis';
     import { createClient } from 'redis';
     
     const redisClient = createClient();
     redisClient.connect();
     
     app.use(session({
       store: new RedisStore({ client: redisClient }),
       // ... other options
     }));
     ```

4. **Database Security**
   - Use connection pooling
   - Enable SSL/TLS for database connections
   - Follow principle of least privilege for database users
   - Regular backups and encryption at rest

5. **Monitoring & Logging**
   - Implement structured logging (Winston, Pino)
   - Monitor failed authentication attempts
   - Set up alerts for unusual activity
   - Use application monitoring (Datadog, New Relic, etc.)

6. **Dependency Security**
   - Regularly update dependencies
   - Use `npm audit` to check for vulnerabilities
   - Consider using Snyk or Dependabot for automated checks

7. **Additional Recommendations**
   - Implement request ID tracking
   - Add request logging middleware
   - Consider implementing 2FA for sensitive operations
   - Regular security audits and penetration testing

## Security Checklist

- [x] Session secret required (no default fallback)
- [x] Authentication middleware on protected routes
- [x] Rate limiting (global and auth-specific)
- [x] Security headers (Helmet)
- [x] Input validation (Zod)
- [x] CORS configuration
- [x] Request size limits
- [x] Error handling without information leakage
- [x] SQL injection protection (ORM)
- [x] Session serialization (ID only)
- [x] CSRF protection (SameSite cookies)
- [ ] Session storage (production-ready - Redis/PostgreSQL)
- [ ] HTTPS enforcement (deployment)
- [ ] Security monitoring and logging
- [ ] Regular dependency updates

## Reporting Security Issues

If you discover a security vulnerability, please email [security contact] instead of using the issue tracker.

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet Documentation](https://helmetjs.github.io/)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

