import request from 'supertest';

import { ApiRoute } from '@packages/constant';

import { app } from '../index';

describe('CSRF Protection', () => {
  describe('CSRF Token Generation', () => {
    it('should generate a unique token for each session', async () => {
      const agent1 = request.agent(app);
      const agent2 = request.agent(app);

      const response1 = await agent1.get(ApiRoute.AuthCsrfToken);
      const response2 = await agent2.get(ApiRoute.AuthCsrfToken);

      expect(response1.body.csrfToken).toBeDefined();
      expect(response2.body.csrfToken).toBeDefined();
      // Different sessions should have different tokens
      expect(response1.body.csrfToken).not.toBe(response2.body.csrfToken);
    });

    it('should maintain the same token across requests in the same session', async () => {
      const agent = request.agent(app);

      const response1 = await agent.get(ApiRoute.AuthCsrfToken);
      const response2 = await agent.get(ApiRoute.AuthCsrfToken);

      expect(response1.body.csrfToken).toBe(response2.body.csrfToken);
    });
  });

  describe('CSRF Token Validation', () => {
    it('should reject POST requests without CSRF token', async () => {
      const response = await request(app).post(ApiRoute.AuthLogout);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('CSRF');
    });

    it('should reject POST requests with invalid CSRF token', async () => {
      const agent = request.agent(app);

      // Get a valid session
      await agent.get(ApiRoute.AuthCsrfToken);

      // Try to use an invalid token
      const response = await agent
        .post(ApiRoute.AuthLogout)
        .set('X-CSRF-Token', 'invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toContain('Invalid CSRF token');
    });

    it('should accept POST requests with valid CSRF token', async () => {
      const agent = request.agent(app);

      const tokenResponse = await agent.get(ApiRoute.AuthCsrfToken);
      const csrfToken = tokenResponse.body.csrfToken;

      const response = await agent
        .post(ApiRoute.AuthLogout)
        .set('X-CSRF-Token', csrfToken);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should not require CSRF token for GET requests', async () => {
      const response = await request(app).get(ApiRoute.AuthUser);

      // Should not fail due to CSRF, but due to authentication
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Not authenticated');
    });
  });

  describe('CSRF Cookie', () => {
    it('should set XSRF-TOKEN cookie', async () => {
      const agent = request.agent(app);

      const response = await agent.get(ApiRoute.AuthCsrfToken);

      const cookies = response.headers['set-cookie'] as unknown as string[] | undefined;
      expect(cookies).toBeDefined();
      
      const xsrfCookie = cookies?.find((cookie) =>
        cookie.startsWith('XSRF-TOKEN=')
      );
      expect(xsrfCookie).toBeDefined();
    });

    it('should set httpOnly to false for XSRF-TOKEN cookie', async () => {
      const agent = request.agent(app);

      const response = await agent.get(ApiRoute.AuthCsrfToken);

      const cookies = response.headers['set-cookie'] as unknown as string[] | undefined;
      const xsrfCookie = cookies?.find((cookie) =>
        cookie.startsWith('XSRF-TOKEN=')
      );
      
      // XSRF-TOKEN should NOT have HttpOnly flag (needs to be accessible to JS)
      expect(xsrfCookie).toBeDefined();
      expect(xsrfCookie).not.toContain('HttpOnly');
    });
  });
});

