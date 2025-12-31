import request from 'supertest';

import { app } from '../index';

describe('Middleware', () => {
  describe('Request ID Middleware', () => {
    it('should generate a request ID if not provided', async () => {
      const response = await request(app).get('/');

      expect(response.headers['x-request-id']).toBeDefined();
      expect(typeof response.headers['x-request-id']).toBe('string');
      expect(response.headers['x-request-id'].length).toBeGreaterThan(0);
    });

    it('should use provided request ID', async () => {
      const customRequestId = 'custom-request-id-123';
      const response = await request(app)
        .get('/')
        .set('X-Request-ID', customRequestId);

      expect(response.headers['x-request-id']).toBe(customRequestId);
    });
  });

  describe('API Versioning Middleware', () => {
    it('should default to v1 if no version specified', async () => {
      const response = await request(app).get('/');

      expect(response.headers['x-api-version']).toBe('v1');
    });

    it('should use version from X-API-Version header', async () => {
      const response = await request(app)
        .get('/')
        .set('X-API-Version', 'v2');

      expect(response.headers['x-api-version']).toBe('v2');
    });

    it('should use version from Accept header', async () => {
      const response = await request(app)
        .get('/')
        .set('Accept', 'application/vnd.api.v3+json');

      expect(response.headers['x-api-version']).toBe('v3');
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', async () => {
      const response = await request(app).get('/');

      // Helmet should add various security headers
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .get('/')
        .set('Origin', 'http://localhost:3000');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should not exceed rate limit for normal usage', async () => {
      const requests = [];
      for (let i = 0; i < 10; i++) {
        requests.push(request(app).get('/'));
      }

      const responses = await Promise.all(requests);

      // All should succeed within rate limit
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});

