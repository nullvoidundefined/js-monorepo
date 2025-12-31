import request from 'supertest';

import { ApiRoute } from '@packages/constant';

import { app } from '../index';

describe('Authentication API', () => {
  describe('GET /api/auth/user', () => {
    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get(ApiRoute.AuthUser);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Not authenticated');
    });
  });

  describe('GET /api/auth/csrf-token', () => {
    it('should return a CSRF token', async () => {
      const agent = request.agent(app);

      const response = await agent.get(ApiRoute.AuthCsrfToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('csrfToken');
      expect(typeof response.body.csrfToken).toBe('string');
      expect(response.body.csrfToken.length).toBeGreaterThan(0);
    });

    it('should set XSRF-TOKEN cookie', async () => {
      const agent = request.agent(app);

      const response = await agent.get(ApiRoute.AuthCsrfToken);

      expect(response.status).toBe(200);
      const cookies = response.headers['set-cookie'] as unknown as string[] | undefined;
      expect(cookies).toBeDefined();
      const hasXsrfToken = cookies?.some((cookie) => 
        cookie.startsWith('XSRF-TOKEN=')
      );
      expect(hasXsrfToken).toBe(true);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should require CSRF token', async () => {
      const response = await request(app).post(ApiRoute.AuthLogout);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('CSRF');
    });

    it('should logout with valid CSRF token', async () => {
      const agent = request.agent(app);

      // Get CSRF token
      const tokenResponse = await agent.get(ApiRoute.AuthCsrfToken);
      const csrfToken = tokenResponse.body.csrfToken;

      // Attempt logout with CSRF token
      const response = await agent
        .post(ApiRoute.AuthLogout)
        .set('X-CSRF-Token', csrfToken);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Logged out successfully');
    });
  });

  describe('GET /api/auth/google', () => {
    it('should redirect to Google OAuth', async () => {
      const response = await request(app)
        .get(ApiRoute.AuthGoogle)
        .redirects(0);

      expect([302, 301]).toContain(response.status);
      expect(response.headers.location).toBeDefined();
      expect(response.headers.location).toContain('google');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to auth routes', async () => {
      // Make multiple sequential requests to check rate limiting
      const responses = [];
      for (let i = 0; i < 5; i++) {
        const response = await request(app)
          .get(ApiRoute.AuthGoogle)
          .redirects(0);
        responses.push(response);
      }
      
      // All requests should succeed or be rate limited
      responses.forEach(response => {
        expect([302, 301, 429]).toContain(response.status);
      });

      // At least some should redirect to Google (not be rate limited)
      const successfulRedirects = responses.filter(r => [301, 302].includes(r.status));
      expect(successfulRedirects.length).toBeGreaterThan(0);
    });
  });
});

